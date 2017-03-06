/* global window, navigator, document, MediaStreamTrack */

(function() {
  const app = {
    init() {
      videoStream.init();
    }
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
