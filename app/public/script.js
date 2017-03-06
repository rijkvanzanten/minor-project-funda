/* global window, navigator, document, MediaStreamTrack */

(function() {
  const app = {
    init() {
      videoStream.init();
    }
  };

  const videoStream = {
    init() {
      MediaStreamTrack.getSources(sourcesInfo => {
        const videoSource = sourcesInfo.filter(source => source.facing === 'environment');
        navigator.mediaDevices
          .getUserMedia(this.constraints(videoSource[0].id))
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
          optional: [{sourceId: videoSource}]
        }
      }
    },
    stream(stream) {
      window.stream = stream; // make variable available to browser console
      document.getElementById('stream').srcObject = stream;
    }
  };

  window.constraints = video.constraints;
  app.init();
}());
