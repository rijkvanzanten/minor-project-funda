/* global window, navigator, document, fetch */

(function() {
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
    }
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

  const compass = {
    init() {
      window.addEventListener('deviceorientationabsolute', event => {
        this.value = Math.floor(360 - event.alpha);
      });
    },
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

        document.getElementById('lat').innerText = location.position.latitude;
        document.getElementById('lng').innerText = location.position.longitude;
        document.getElementById('com').innerText = compass.value;

        overlay.render();
      }, 1000 / 60)
    },

    render() {
      if(!app.store.isLoading && location.position && compass.value && !app.store.objects.length) {
        request.nearObjects(location.position);
      } else if(!app.store.isLoading && app.store.objects.length){
        console.log(app.store.objects);
      }
    }
  };

  app.init();
}());
