/* global window, navigator, document */

(function() {
  const app = {
    init() {
      videoStream.init();
      compass.init();
      location.init();
      overlay.init();
    }
  };

  const location = {
    init() {
      navigator.geolocation.watchPosition(position => {
        this.position = position.coords;
      });
    },
    position: {}
  };

  const compass = {
    init() {
      window.addEventListener('deviceorientationabsolute', event => {
        this.value = Math.ceil(Math.floor(360 - event.alpha) / 5) * 5;
      });
    },
    value: null
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

    }
  };

  app.init();
}());
