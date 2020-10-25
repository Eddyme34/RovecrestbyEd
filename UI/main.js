// Modules to control application life and create native browser window
const { app, BrowserWindow, webContents } = require('electron')
const net = require('net');
const path = require('path');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    // fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    show: false,  // Delay show to attach listener for event 'ready-to-show'
  })

  // When the web page has been rendered, attach camera feed to window.
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    attachCameraFeed(mainWindow.webContents)
  });
  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    app.quit();
    sckMsgClient.destroy();
    sckVidClient.destroy();
    sckVid2Client.destroy();
    sckCmd1Port.destroy();
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Sockets
const SCK_MSG_PORT = 9999
const SCK_VID_PORT = 1234
const SCK_VID2_PORT = 8080
const S_CMD1_PORT = 1235
let sckVidClient
let sckMsgClient
let sckVid2Client
let sckCmd1Port

/**
 * Encapsulates video data
 */
class VideoData {
  constructor(id) {
    this.id = id;

    this.frameSize = VideoData.FRAME_SIZE_NOT_READY;
    this.videoDataBuffer = Buffer.alloc(0);
    this.startTime = null;
  }

  static FRAME_SIZE_NOT_READY = -1         // Used for `frameSize` variable to indicate
                                           // that frameSize is not known yet.
  static FRAME_PAYLOAD_SIZE = 4            // Frame size is specified in 4 bits.

  /**
   * Returns video data id
   */
  getID() {
    return this.id;
  }

  /**
   * Returns video data buffer.
   */
  getVideoDataBuffer() {
    return this.videoDataBuffer;
  }

  /**
   * Return start time of a new frame processing.
   * If no frame is being processed, return null.
   */
  getStartTime() {
    return this.startTime;
  }

  /**
   * Call when new frame is being read to start timer.
   */
  startTimer() {
    this.startTime = Date.now();
  }

  /**
   * Returns size of frame being processed or about to be processed.
   * Returns -1 if no frame is being processed or about to be processed.
   */
  getFrameSize() {
    return this.frameSize;
  }

  /**
   * Returns true if the frame size of next frame is ready.
   */
  hasFrameSize() {
    return this.frameSize != VideoData.FRAME_SIZE_NOT_READY;
  }

  /**
   * Returns true if both the frame size and frame data is ready to
   * be read.
   */
  isReadFrameReady() {
    return this.hasFrameSize() && this.videoDataBuffer.length >= this.frameSize;
  }

  /**
   * Reads (and removes) the frame data from the buffer.
   *
   * If frame data is not ready to be read, returns empty buffer.
   */
  readFrame() {
    if (this.isReadFrameReady()) {
      // Retrieve frame data.
      const frameData = this.videoDataBuffer.slice(0, this.frameSize);

      // Remove frame data from accumulated data buffer.
      this.videoDataBuffer = this.videoDataBuffer.slice(this.frameSize);
      // Reset frame size.
      this.frameSize = VideoData.FRAME_SIZE_NOT_READY;

      return frameData;
    } else {
      return Buffer.alloc(0);
    }
  }

  /**
   * Appends data to buffer.
   * @param {Buffer} data Data to append to buffer.
   */
  appendBuffer(data) {
    this.videoDataBuffer = Buffer.concat([this.videoDataBuffer, data]);

    // If frame size has not been set yet, try to fetch it from buffer
    if (!this.hasFrameSize()) {
      this.startTimer();
      try {
        this.frameSize = this.videoDataBuffer.readInt32LE();
        this.videoDataBuffer = this.videoDataBuffer.slice(VideoData.FRAME_PAYLOAD_SIZE);
      } catch { }
    }
  }
}

/**
 * Process the fully accumulated data buffer, including reading frame size,
 * reading frame data, and sending frame data to main window.
 * @param {Buffer} data The data read from the socket.
 * @param {WebContents} contents The event emitter for the window to send to.
 * @param {VideoData} videoData Video data.
 */
async function processVideoData(data, contents, videoData) {
  videoData.appendBuffer(data);

  // If frame size is ready and frame data buffer is ready, then read frame
  if (videoData.isReadFrameReady()) {
    // Retrieve frame data.
    const frameData = videoData.readFrame();

    // Send data to frontend.
    contents.send(videoData.getID(), frameData.toString());

    const milliseconds = Date.now() - videoData.getStartTime();
    const seconds = milliseconds / 1000;
    const fps = 1 / seconds;
    console.log('----------------------');
    // console.log(`Video 1 mill: ${milliseconds}`);
    // console.log(`Video 1 sec: ${seconds}`);
    console.log(`${videoData.getID()} FPS: ${fps}`);
  }
}

/**
 * Set up sockets needed for
 * @param {WebContents} webContents Main window web contents.
 */
function attachCameraFeed(webContents) {
  // Connect video socket
  sckVidClient = new net.Socket();
  sckVidClient.connect(SCK_VID_PORT, '127.0.0.1',function() {
    console.log("Connected to video socket");
  });

  const videoData = new VideoData('rover');
  sckVidClient.on('data', function(data) {
    // Process video data, sending video to main window if needed.
    processVideoData(data, webContents, videoData);
  });

  sckVidClient.on('close', function() {
    console.log('Video connection closed');
  });

  // Connect messenger socket
  sckMsgClient = new net.Socket();
  sckMsgClient.connect(SCK_MSG_PORT, '127.0.0.1', function() {
    console.log("Connected to message socket");
  });

  sckMsgClient.on('data', function(data) {
  });

  sckMsgClient.on('close', function() {
    console.log('Message connection closed');
  });

  sckVid2Client = new net.Socket();
  sckVid2Client.connect(SCK_VID2_PORT, '127.0.0.1', function() {
    console.log("Connected to video 2 socket");
  });

  const videoData2 = new VideoData('rover2');
  sckVid2Client.on('data', function(data) {
    // Process video data, sending video to main window if needed.
    processVideoData(data, webContents, videoData2);
  });

  sckVid2Client.on('close', function() {
    console.log('Message connection closed');
  });

  sckCmd1Port = new net.Socket();
  sckCmd1Port.connect(S_CMD1_PORT, '127.0.0.1', function() {
    console.log("Connected to cmd 1 socket");
  });

  sckCmd1Port.on('data', function(data) {
  });

  sckCmd1Port.on('close', function() {
    console.log('Message connection closed');
  });
}
