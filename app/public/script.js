/* global window, navigator, document, fetch */

(function() {
  const utils = {
    /**
     * Measures distance between two lat lng points
     *
     * Based on the haversine formula
     * a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
     * c = 2 ⋅ atan2( √a, √(1−a) )
     * d = R ⋅ c
     *
     * where φ is latitude, λ is longitude, R is earth’s radius (mean radius = 6,371km)
     * http://www.movable-type.co.uk/scripts/latlong.html
     */
    calculateDistance(latLon1, latLon2) {
      const radius = 6371e3; // earths radius
      const lat1 = latLon1.lat.toRadians();
      const lat2 = latLon2.lat.toRadians();
      const latitudeDifference = (latLon2.lat - latLon1.lat).toRadians();
      const longitudeDifference = (latLon2.lon - latLon1.lon).toRadians();

      // This is just dark magic, check the article mentioned above
      const a = Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(longitudeDifference / 2) * Math.sin(longitudeDifference / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return radius * c;
    },

    /**
     * Measures angle v north between two points
     */
    calculateAngle(latLon1, latLon2) {
      const lat = latLon2.lat - latLon1.lat;
      const lon = latLon2.lon - latLon1.lon;

      let angle = Math.floor(Math.atan2(lat, lon) * 180 / Math.PI);

      while(angle < 0) {
        angle += 360;
      }

      return angle;
    }
  };

  const app = {
    init() {
      videoStream.init();
      compass.init();
      location.init();
      overlay.init();
    },
    store: {
      isLoading: false,
      objects: []
    },
    width: 0
  };

  const request = {
    locality(lat, lng, callback) {
      fetch(`/locality/${lat}/${lng}`)
        .then(res => res.json())
        .then(res => callback(res));
    },
    nearObjects(position) {
      app.store.isLoading = true;
      fetch(`/objects/${position.locality}/${position.postalCode}`)
        .then(res => res.json())
        .then(res => {
          app.store.isLoading = false;
          app.store.objects = res;
        });
    }
  };

  const location = {
    init() {
      navigator.geolocation.watchPosition(position => {
        const { latitude, longitude } = position.coords;

        request.locality(latitude, longitude, res => {
          this.position = position.coords;
          Object.assign(this.position, res);
        });
      });
    },
    position: false
  };

  /**
   * Compass object
   * normalizedValue = value which only gets updated when the difference is >= 5
   * value = real-time actual value
   */
  const compass = {
    init() {
      window.addEventListener('deviceorientationabsolute', event => {
        const newValue = Math.floor(360 - event.alpha);

        if (Math.abs(this.normalizedValue - newValue) >= 5) this.normalizedValue = newValue;
        this.value = newValue;
      });
    },
    normalizedValue: false,
    value: false
  };

  const videoStream = {
    init() {
      navigator.mediaDevices
        .getUserMedia(this.constraints)
        .then(this.stream)
        .catch(err => {
          console.error(err);
        });
    },
    constraints: {
      audio: false,
      video: { facingMode: 'environment' }
    },
    stream(stream) {
      window.stream = stream; // make variable available to browser console
      document.getElementById('stream').srcObject = stream;
    }
  };

  const overlay = {
    init() {
      this.frame();
    },

    frame() {
      setTimeout(() => {
        window.requestAnimationFrame(overlay.frame);

        overlay.render();
      }, 1000 / 60);
    },

    /**
     * Render loop
     */
    render() {
      // If not loading and no records
      if(!app.store.isLoading && location.position && compass.value && !app.store.objects.length) {
        request.nearObjects(location.position);
      }

      // If records but no markers rendered
      else if(!app.store.isLoading && app.store.objects.length && !document.querySelectorAll('.marker-box').length) {
        const template = document.getElementById('marker');

        app.store.objects.forEach(obj => {
          const instance = template.content.cloneNode(true);
          instance.querySelector('.marker-box').innerText = obj.Adres;
          instance.querySelector('.marker-box').id = obj.Id;
          document.getElementById('overlay').append(instance);
        });
      }

      // Main marker positioning
      else {
        const userLatLon = {
          lat: location.position.latitude,
          lon: location.position.longitude
        };

        app.store.objects.forEach(obj => {
          const element = document.getElementById(obj.Id);
          const objLatLon = {
            lat: obj.WGS84_Y,
            lon: obj.WGS84_X
          };

          const angle = utils.calculateAngle(userLatLon, objLatLon);

          if(angle >= compass.normalizedValue - 5 && angle <= compass.normalizedValue + 5) {
            element.style.display = 'block';
          } else {
            element.style.display = 'none';
          }

        });
      }
    }
  };

  app.init();
}());
