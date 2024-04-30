class AudioMeterProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this.clipping = false;
      this.lastClip = 0;
      this.volume = 0;
      this.clipLevel = 0.98;
      this.averaging = 0.95;
      this.clipLag = 750;

      this.port.onmessage = (event) => {
        if (event.data === 'checkClipping') {
          this.port.postMessage({ clipping: this.clipping });
        } else if (event.data === 'shutdown') {
          this.port.postMessage('shutdown');
          this.port.close();
        }
      };
    }
  
    static get parameterDescriptors() {
      return [];
    }
  
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      const output = outputs[0];

      const channel = input[0];
      const channelLength = channel.length;
      // console.log('channelLength', channelLength);
      let sum = 0;
      for (let i = 0; i < channelLength; i++) {
        const sample = channel[i];
        if (Math.abs(sample) >= this.clipLevel) {
          this.clipping = true;
          this.port.postMessage({ clipping: this.clipping, volume: this.volume });
          console.log('chipping', true);
          this.lastClip = Date.now()
        }

  
        sum += sample * sample;
      }

      
      const rms = Math.sqrt(sum / channelLength);
      this.volume = Math.max(rms, this.volume * this.averaging);
      if ((this.lastClip + this.clipLag) < Date.now()){
        this.clipping = false;
        this.port.postMessage({ clipping: this.clipping, volume: this.volume });
      }
      this.port.postMessage({ volume: this.volume });
      return true;
    }
  }
  
  registerProcessor('audio-meter-processor', AudioMeterProcessor);
  