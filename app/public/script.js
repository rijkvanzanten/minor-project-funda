/* global window, navigator, document, fetch */

(function() {

  startVideoStream(document.getElementById('video-stream'));

  watchLocation(location => {
    fetchObjects(location, objects => {
      renderObjects(
        document.getElementById('overlay'),
        objects,
        document.getElementById('marker')
      );
    });
  });

  window.addEventListener('deviceorientationabsolute', throttle(updateMarkerLocations, 1000 / 60));

  // Utils
  // ----------------------------------------------------------------------------------------------------------------
  /**
   * Measures distance between two lat lng points
   *
   * where φ is latitude, λ is longitude, R is earth’s radius (mean radius = 6,371km)
   * http://www.movable-type.co.uk/scripts/latlong.html
   *
   * @param {Object} latLon1 lat, lng of position 1
   * @param {Object} latLon2 lat, lng of position 2
   * @return {Number} Meters between points
   */
  function calculateDistance(latLon1, latLon2) {
    const φ1 = toRadians(latLon1.latitude);
    const φ2 = toRadians(latLon2.latitude);
    const Δλ = toRadians(latLon2.longitude - latLon1.longitude);

    const R = 6371e3;

    return Math.round(Math.acos(Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ)) * R);
  }

  /**
   * Converts angle to radians
   * @param {Number} val angle value
   * @return {Number} radian value
   */
  function toRadians(val) {
    return val * Math.PI / 180;
  }

  /**
   * Measures angle v north between two points
   * @param {Object} latLon1 lat, lng of position 1
   * @param {Object} latLon2 lat, lng of position 2
   * @return {Number} angle between two points
   */
  function calculateAngle(latLon1, latLon2) {
    const lat = latLon2.latitude - latLon1.latitude;
    const lon = latLon2.longitude - latLon1.longitude;

    let angle = Math.floor(Math.atan2(lat, lon) * 180 / Math.PI);

    while(angle < 0) {
      angle += 360;
    }

    return angle;
  }

  /**
   * Convert value from one range to another
   * @param {Number} value value to convert
   * @param {Object} oldRange min, max of values range
   * @param {Object} newRange min, max of desired range
   * @return {Number} value converted to other range
   */
  function convertRange(value, oldRange, newRange) {
    return ((value - oldRange.min) * (newRange.max - newRange.min)) / (oldRange.max - oldRange.min) + newRange.min;
  }

  /**
   * Throttles function to limit rate of execution
   * @param {Function} fn Function to limit
   * @param {Number} threshold fire every n ms
   */
  function throttle(fn, threshold) {
    let last;
    let deferTimer;

    return function() {
      const context = this;

      const now = +new Date;
      const args = arguments;

      if(last && now < last + threshold) {
        clearTimeout(deferTimer);
        deferTimer = setTimeout(() => {
          last = now;
          fn.apply(context, args);
        }, threshold);
      } else {
        last = now;
        fn.apply(context, args);
      }
    };
  }

  // Videostream
  // ----------------------------------------------------------------------------------------------------------------
  /**
   * Start the video stream
   * @param {HTMLElement} element to render video to
   */
  function startVideoStream(element) {
    const constraints = {
      audio: false,
      video: { facingMode: 'environment' }
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(stream => {
        element.srcObject = stream;
      })
      .catch(err => console.error(err));
  }

  // Geo location
  // ----------------------------------------------------------------------------------------------------------------
  
  /**
   * Watch geo location and fire callback on changes
   * @param {Function} callback 
   */
  function watchLocation(callback) {
    navigator.geolocation.watchPosition(position => {
      const { latitude, longitude } = position.coords;
      callback({ latitude, longitude });
    });
  }

  /**
   * Fetches locality data based on geolocation
   * @param {Object} location latitude, longitude
   * @param {Function} callback 
   */
  function fetchLocality(location, callback) {
    fetch(`/locality/${location.latitude}/${location.longitude}`)
        .then(res => res.json())
        .then(res => callback(res))
        .catch(err => console.error(err));
  }

  /**
   * Fetch Funda house objects based on locality
   * @param {Object} location latitude, longitude
   * @param {Function} callback
   */
  function fetchObjects(location, callback) {
    fetchLocality(location, res => {
      const url = res.postalCode ? `/objects/${res.locality}/${res.postalCode}` : `/objects/${res.locality}`;

      fetch(url)
        .then(res => res.json())
        .then(res => res.map(object => {
          const objectLocation = {
            latitude: object.WGS84_Y,
            longitude: object.WGS84_X
          };

          return Object.assign(object, {
            distance: calculateDistance(location, objectLocation),
            angle: calculateAngle(location, objectLocation)
          });
        }))
        .then(res => res.filter(object => object.distance < 2000))
        .then(res => callback(res))
        .catch(err => console.error(err));
    });
  }

  // Rendering
  // ----------------------------------------------------------------------------------------------------------------
  /**
   * Renders array of house objects to screen
   * @param {Array} objectsArray 
   */
  function renderObjects(element, objectsArray, template) {
    clearElement(element);

    objectsArray.forEach(object => {
      const instance = template.content.cloneNode(true);
      const markerBox = instance.querySelector('.marker-box');

      const distanceRange = { min: 0, max: 2000 };
      const opacityRange = { min: 1, max: 0.3 };
      const opacity = convertRange(object.distance, distanceRange, opacityRange);
      
      instance.getElementById('distance').innerText = object.distance + 'm';

      markerBox.setAttribute('href', object.URL);
      markerBox.setAttribute('data-angle', object.angle);
      markerBox.setAttribute('data-distance', object.distance);

      markerBox.style.zIndex = `${Math.floor(opacity * 100)}`;
      markerBox.style.opacity = `${opacity}`;

      element.appendChild(instance);
    });
  }
  
  /**
   * Clear all children of an element
   * @param {HTMLElement} element 
   */
  function clearElement(element) {
    while(element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function updateMarkerLocations(event) {
    let { alpha, gamma } = event;
    let translationY = -(90 + gamma);
 
    /**
     * Alpha flips 180degrees when gamma is across the tipping point of 90deg
     * gamma range: 0 ... -87, -88, -89, 89, 88, 87, ... 0
     */
    if(gamma > 0) {
      alpha = alpha - 180;
      translationY = 90 - gamma;
    }

    document.querySelectorAll('.marker-box').forEach(marker => {
      const angle = marker.getAttribute('data-angle');
      const distance = marker.getAttribute('data-distance');

      const distanceRange = { min: 0, max: 2000 };
      const scaleRange = { min: 1, max: 0.3 };
      const visibleArea = { min: -20, max: 20 }; // FOV Range
      const viewportOffset = { min: -(window.innerHeight / 2), max: window.innerHeight / 2 };

      if(angle >= alpha - 20 || angle <= alpha + 20) {
        const delta = angle - alpha;
        const scale = convertRange(distance, distanceRange, scaleRange);
        const translation = convertRange(delta, visibleArea, viewportOffset);

        marker.style.display = 'flex';
        marker.style.transform = `scale(${scale}) translate(${-1 * translation}px, ${translationY * 10}px)`;
      } else {
        marker.style.display = 'none';
      }
    });
  }

}());
