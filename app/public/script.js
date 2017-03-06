/* global window, navigator, document, MediaStreamTrack */

(function() {
  const app = {
    init() {
      compass.init();
      videoStream.init();
      // overlay.init();
    }
  };

  const compass = {
    init() {
      window.addEventListener('deviceorientationabsolute', event => {
        this.value = Math.floor(360 - event.alpha);
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
      window.requestAnimationFrame(overlay.frame);

      overlay.render();
    },

    render() {
      console.log('render');
    }
  };

  app.init();
}());
