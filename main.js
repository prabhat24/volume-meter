let audioContext = null;
let meter = null;
let canvasContext = null;
const WIDTH = 500;
const HEIGHT = 50;
let rafID = null;
let mediaStreamSource = null;
let localAudio = null

window.onload = function() {
  // grab our canvas
  canvasContext = document.getElementById("meter").getContext("2d");
  localAudio = document.getElementById("local-audio")
};

function startMeter() {
  // grab an audio context
  audioContext = new AudioContext();

  // Register the AudioWorkletProcessor
    // Attempt to get audio input
    navigator.mediaDevices.getUserMedia({
      "audio": true
    }).then(async (stream) => {
      localAudio.srcObject = stream
      await audioContext.audioWorklet.addModule('audio-meter-processor.js')
      // Create an AudioNode from the stream.
      mediaStreamSource = audioContext.createMediaStreamSource(stream);

      // // low pass filter
      // const lowPassFilter = audioContext.createBiquadFilter();
      // lowPassFilter.type = 'lowpass';
      // lowPassFilter.frequency.value = 20000; // 20 kHz cutoff frequency


      // // high pass filter
      // const highPassFilter = audioContext.createBiquadFilter();
      // highPassFilter.type = 'highpass';
      // highPassFilter.frequency.value = 20; // 20 Hz cutoff frequency

      // mediaStreamSource.connect(lowPassFilter);
      // lowPassFilter.connect(highPassFilter);

      // Create a new volume meter and connect it.
      meter = new AudioWorkletNode(audioContext, 'audio-meter-processor');
      mediaStreamSource.connect(meter);

      // kick off the visual updating
      drawLoop();
    }).catch((err) => {
      // always check for errors at the end.
      console.error(`${err.name}: ${err.message}`);
      alert('Stream generation failed.');
    });
}

function drawLoop(time) {
  // clear the background
    canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
    meter.port.onmessage = (event) => {
    canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
    if (event.data.hasOwnProperty("clipping")) {
        console.log('here chipping data');
        if (event.data.clipping === true){
            canvasContext.fillStyle = "red";
            console.log('here red');
        }
        else{
            canvasContext.fillStyle = "green";
            console.log('here green');
        }
    }
    canvasContext.fillRect(0, 0, event.data.volume * WIDTH * 1.4, HEIGHT);
    // draw a bar based on the current volume
    // console.log('drawLoop.volume', event.data.volume );
    };
}