/* global window, navigator, document, fetch */

(function() {
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
    const φ1 = toRadians(latLon1.lat);
    const φ2 = toRadians(latLon2.lat);
    const Δλ = toRadians(latLon2.lon - latLon1.lon);

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
    const lat = latLon2.lat - latLon1.lat;
    const lon = latLon2.lon - latLon1.lon;

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
}());
