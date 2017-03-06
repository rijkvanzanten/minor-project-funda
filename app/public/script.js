/* global window, google, document */

(function() {
  const app = {
    init() {
      console.log('init');
    }
  };

  const map = {
    instance: null,
    init() {
      this.instance = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 52.379189, lng: 4.899431},
        zoom: 6,
        disableDefaultUI: true
      });
    }
  };

  // Make app initialization publicly available for Google maps callback
  window.initMap = map.init;
}());
