let meter = null

async function run() {
    const localStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const audioElement = document.getElementById('local-audio')
    audioElement.srcObject = localStream


    audioContext = new AudioContext();
    await audioContext.audioWorklet.addModule('audio-meter-processor.js')
    mediaStreamSource = audioContext.createMediaStreamSource(localStream);
    meter = new AudioWorkletNode(audioContext, 'audio-meter-processor');
    mediaStreamSource.connect(meter)
  
    meter.port.onmessage = (event) => {
        // if (event.data.hasOwnProperty("clipping")) {
        //     // console.log('here chipping data');
        //     if (event.data.clipping === true){
        //         // console.log('here red');
        //     }
        //     else{
        //         // console.log('here green');
        //     }
        // }
        if (event.data === "shutdown") {
            meter.disconnect()
        }
        console.log('event.data.volume', (100 * event.data.volume).toFixed(2));
        document.getElementById('db-level').innerHTML = (100 * event.data.volume).toFixed(2)
    
  }
}
function pause() {
    meter.port.postMessage("shutdown")
}