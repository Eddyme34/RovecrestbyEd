// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const {ipcRenderer} = require('electron');
const PREFIX = 'data:image/jpeg;base64,';

class CameraUIData {
  constructor({canvasID, fpsID}) {
    this.canvasID = canvasID
    this.fpsID = fpsID

    // Internal fields
    this.ready = true;
    this.previousRenderTime = Date.now();
  }

  /**
   * Makes it so that `isReady()` returns false.
   */
  setReadyToFalse() {
    this.ready = false;
  }

  /**
   * Returns true if no frame is being processed currently,
   * false otherwise.
   */
  isReady() {
    return this.ready;
  }

  /**
   * Returns id of canvas used to display this camera
   */
  getCanvasID() {
    return this.canvasID;
  }

  /**
   * Returns id of DOM element used to display FPS.
   */
  getFpsID() {
    return this.fpsID
  }

  /**
   * Returns the last time the frame was rendered by this camera.
   * If no frame has been rendered, returns the time that this
   * object was initialized.
   */
  getPreviousRenderTime() {
    return this.previousRenderTime;
  }

  /**
   * Should be called after a frame is rendered.
   *
   * Updates fields so to indicate that camera is ready
   * to process new frame as well as some meta info (e.g. previous render time).
   */
  handleRender() {
    this.previousRenderTime = Date.now();
    this.ready = true;
  }
}

/**
 * Event handler for IPC Render.
 * @param {String} data Data sent from IPC
 * @param {CameraUIData} cameraUIData Camera UI Data
 */
function handleCameraData(data, cameraUIData) {
  if (cameraUIData.isReady()) {
    cameraUIData.setReadyToFalse();

    var canvas = document.getElementById(cameraUIData.getCanvasID());
    var ctx = canvas.getContext("2d");

    var image = new Image();
    image.onload = function() {
      canvas.width = image.width;
      canvas.height = image.height
      ctx.drawImage(image, 0, 0);

      const milliseconds = Date.now() - cameraUIData.getPreviousRenderTime();
      const seconds = milliseconds / 1000;
      const fps = 1 / seconds;
      document.getElementById(cameraUIData.fpsID).innerText = "FPS: " + Math.trunc(fps);

      cameraUIData.handleRender();
    };
    image.src = PREFIX + data;
  }
}

function main() {
  const roverCamera = new CameraUIData({canvasID: 'roverCamera', fpsID: 'roverCameraFPS'});
  ipcRenderer.on('rover', (event, data) => {
    handleCameraData(data, roverCamera);
  });

  const roverCamera2 = new CameraUIData({canvasID: 'roverCamera2', fpsID: 'roverCameraFPS2'});
  ipcRenderer.on('rover2', (event, data) => {
    handleCameraData(data, roverCamera2);
  });
}

main();
