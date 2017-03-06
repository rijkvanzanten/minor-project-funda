/* global window, navigator, document, MediaStreamTrack */

(function() {
  /**
   * Underscores throttle function
   */
  function throttle(func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function() {
      previous = options.leading === false ? 0 : Date.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    var throttled = function() {
      var now = Date.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };

    throttled.cancel = function() {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  }

  const app = {
    init() {
      compass.init();
      videoStream.init();
    }
  };

  const compass = {
    init() {
      window.addEventListener('deviceorientationabsolute', throttle(event => {
        this.value = Math.floor(360 - event.alpha);
      }, 10));
    },
    value: null
  };

  const videoStream = {
    init() {
      // Get all media sources (soon to be deprecated, but faceMode constraint
      //   won't work in my version of Android Chrome
      MediaStreamTrack.getSources(sourcesInfo => {
        // Select rear-camera
        const videoSource = sourcesInfo.filter(source => source.facing === 'environment')[0];

        navigator.mediaDevices
          .getUserMedia(this.constraints(videoSource.id))
          .then(this.stream)
          .catch(err => {
            console.error(err);
          });
      });
    },
    constraints(videoSource) {
      return {
        audio: false,
        video: {
          optional: [ // only allow certain camera
            { sourceId: videoSource }
          ]
        }
      };
    },
    stream(stream) {
      window.stream = stream; // make variable available to browser console
      document.getElementById('stream').srcObject = stream;
    }
  };

  app.init();
}());
