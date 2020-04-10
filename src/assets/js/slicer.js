/**
 * Reference : 
 * [How to slice an AudioBuffer](https://miguelmota.com/bytes/slice-audiobuffer/)
 * [Web audio concepts and usage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
 */

/**
 * Exaple of usage :
  audioBufferSlice({
    url: 'http://audiourl.com/12343512321331.wav', // the url of audio file
    // arrayBuffer, // the arrayBuffer. If set this value, audioBufferSlice do not use url
    begin: 1000, // the time of begin. (using millisecond)
    end: 5000, // the time of end. (using millisecond)
    // responseCallback, // If it is a function and url has value, this function just use the response value of url as an argument of responseCallbak and call responseCallbak.
    callback: audioSource => {
       // After slicing the audio file, callback is called with AudioSourceResult instance.
       
       audioSource.start(); // if want to start
       audioSource.start(1, 2); // if want to play from 1s to 2s for audioSource

       audioSource.pause(); // pause the player

       audioSource.stop(); // stop the player

       audioSource.on('playing', e => {
         // event called when every 10 milliseconds
         // if you want to change the time interval use
         // audioSource.setPlayingTimerInterval(time interval with millisecond)

         e.currentTime; // the context current time
         e.playingTime; // the player time
       });

       audioSource.on('pause', e => {
         // event called when the player is paused
         // e is value of AudioScheduledSourceNode ended evnet (https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/ended_event)
       });

       audioSource.on('end', e => {
         // event called when the player end
         // e is value of AudioScheduledSourceNode ended evnet (https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/ended_event)
       });
    },
  })
 */


const audioContext = window.AudioContext || window.webkitAudioContext;

const AudioBufferSlice = function(buffer, begin, end, callback) {
  if (!(this instanceof AudioBufferSlice)) {
    return new AudioBufferSlice(buffer, begin, end, callback);
  }

  let error = null;

  const duration = buffer.duration;
  const channels = buffer.numberOfChannels;
  const rate = buffer.sampleRate;
  
  // AudioBuffer.duration = AudioBuffer.length / AudioBuffer.sampleRate

  if (typeof end === 'function') {
    callback = end;
    end = duration * 1000;
  }

  begin = begin / 1000;
  end = end / 1000;

  if (begin < 0) {
    error = new RangeError('begin time must be greater than 0');
  }

  if (end > duration) {
    error = new RangeError('end time must be less than or equal to ' + duration);
  }

  if (typeof callback !== 'function') {
    error = new TypeError('callback must be a function');
  }

  const startOffset = rate * begin;
  const endOffset = rate * end;
  const frameCount = endOffset - startOffset;
  let newArrayBuffer;

  try {
    newArrayBuffer = new audioContext().createBuffer(channels, frameCount, rate);
    
    const anotherArray = new Float32Array(frameCount);
    const offset = 0;

    for (let channel = 0; channel < channels; channel++) {
      buffer.copyFromChannel(anotherArray, channel, startOffset);
      newArrayBuffer.copyToChannel(anotherArray, channel, offset);
    }
  } catch (e) {
    error = e;
  }

  callback(error, newArrayBuffer);
};

const audioBufferSlice = function ({ url, arrayBuffer, begin, end, responseCallback, callback }) {
  const boundFromDecodeToSlice = fromDecodeToSlice.bind(null, begin, end, callback);

  if (arrayBuffer && arrayBuffer.constructor.name === 'ArrayBuffer') {
    boundFromDecodeToSlice(arrayBuffer);
  } else {
    fetch(url).then(res => {
      if (typeof responseCallback === 'function') {
        responseCallback(res);
      } else if (typeof callback === 'function') {
        let error = null;

        try {
          res.arrayBuffer().then(arrbuf => {
            boundFromDecodeToSlice(arrbuf);
          });
        } catch(e) {
          error = e;
  
          console.error(error);
        }
      }
    });
  }
}

function fromDecodeToSlice(begin, end, callback, arrayBuffer) {
  const audioCtx = new audioContext();
  const source = audioCtx.createBufferSource();
  let error = null;

  audioCtx.decodeAudioData(arrayBuffer, audioBuffer => {
    if (!begin) { begin = 0; }
    if (!end) { end = audioBuffer.duration * 1000; }
    
    AudioBufferSlice(audioBuffer, begin, end, (errorInAudioBufferSlice, slicedAudioBuffer) => {
      if (errorInAudioBufferSlice != null) {
        error = errorInAudioBufferSlice;

        console.error(error);
      } else {
        const gainNode = audioCtx.createGain();

        gainNode.gain.value = 1;

        source.buffer = slicedAudioBuffer;

        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        callback(new AudioSourceResult({
          begin,
          end,
          arrayBuffer,
          audioBuffer,
          slicedAudioBuffer,
          source,
        }));
      }
    });
  });
}

function endedEventListener(e) {
  // clear the time interval
  this.accumulateTimeSpan += this.timeSpan;
  clearInterval(this.timeInterval);
  this.timeInterval = null;

  this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const pauseEventListener = this.events['pause'];
  const endEventListener = this.events['end'];

  if (this.isPause) {
    typeof pauseEventListener === 'function' && pauseEventListener(e);
  }
  if (!this.isPause) {
    typeof endEventListener === 'function' && endEventListener(e);
    this.initialize();
  }
}

function AudioSourceResult({
  begin,
  end,
  arrayBuffer,
  audioBuffer,
  slicedAudioBuffer,
  source,
}) {
  // const values
  this.begin = begin;
  this.end = end;
  this.arrayBuffer = arrayBuffer;
  this.audioBuffer = audioBuffer;
  this.slicedAudioBuffer = slicedAudioBuffer;
  this.source = source;
  // // const values

  this.events = {};

  // modified values
  this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  this.slicedAudioBufferForPlay = slicedAudioBuffer
  this.temporarySlicedAudio = null;

  this.playingSource = null;
  this.isPause = false;

  this.timeInterval = null; // time interval for counting playing time
  this.interval = 10;
  this.accumulateTimeSpan = 0; // accumulate of timeSpan. this is for count the time of playing

  this.startTime = 0;
  this.endTime = 0;
  this.timeSpan = 0;
  // // modified values
}

AudioSourceResult.prototype.initialize = function() {
  this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  this.slicedAudioBufferForPlay = this.slicedAudioBuffer;
  this.temporarySlicedAudio = null;
  this.playingSource = null;
  this.isPause = false;
  this.startTime = 0;
  this.endTime = 0;
  this.timeSpan = 0;
  this.accumulateTimeSpan = 0;
  clearInterval(this.timeInterval);
  this.timeInterval = null;
};

AudioSourceResult.prototype.setPlayingTimerInterval = function(interval) {
  if (typeof interval === 'number' && !isNaN(interval)) {
    this.interval = interval;
  }
};

AudioSourceResult.prototype.start = function(begin, end) {
  const playingListener = this.events['playing'];
  const source = this.audioCtx.createBufferSource();
  const gainNode = this.audioCtx.createGain();

  const A = typeof begin === 'number' ? begin : 0;
  const B = typeof end === 'number' ? end : this.slicedAudioBuffer.duration;

  gainNode.gain.value = 1;

  // separate the sliced audio file into 'temporarySlicedAudio' and 'slicedAudioBufferForPlay' because of helping understanding the logic
  if (this.timeSpan > 0) {
    AudioBufferSlice(this.temporarySlicedAudio, this.timeSpan * 1000, this.temporarySlicedAudio.duration * 1000, (err, newBuffer) => {
      this.temporarySlicedAudio = newBuffer;
      source.buffer = newBuffer;
    });
  } else {
    AudioBufferSlice(this.slicedAudioBufferForPlay, A * 1000, B * 1000, (err, newBuffer) => {
      this.slicedAudioBufferForPlay = newBuffer;
      this.temporarySlicedAudio = newBuffer;
      source.buffer = newBuffer;
    });
  }

  source.connect(gainNode);
  gainNode.connect(this.audioCtx.destination);

  source.addEventListener('ended', endedEventListener.bind(this));

  // make new playingSource
  this.playingSource = source;
  this.isPause = false;
  
  this.startTime = this.playingSource.context.currentTime;
  this.playingSource.start();

  if (typeof playingListener === 'function') {
    // time interval
    this.timeInterval = setInterval(() => {
      playingListener({
        currentTime: this.playingSource.context.currentTime,
        playingTime: this.accumulateTimeSpan + this.playingSource.context.currentTime - this.startTime
      });
    }, this.interval);
  }
  
};

AudioSourceResult.prototype.pause = function() {
  this.isPause = true;
  clearInterval(this.timeInterval);
  this.timeInterval = null;

  if (this.playingSource) {
    this.playingSource.stop();

    this.endTime = this.playingSource.context.currentTime;
    this.timeSpan = this.playingSource.context.currentTime - this.startTime;

    this.playingSource.removeEventListener('ended', endedEventListener);
    this.playingSource = null;
  }
}

AudioSourceResult.prototype.stop = function() {
  this.isPause = false;

  clearInterval(this.timeInterval);
  this.timeInterval = null;

  if (this.playingSource) {
    this.playingSource.stop();
    this.playingSource.removeEventListener('ended', endedEventListener);
    this.playingSource = null;
  }

  this.initialize();
}

AudioSourceResult.prototype.on = function(eventName, listener) {
  this.events[eventName] = listener;
};

const AudioTools = {
  AudioContext,
  AudioBufferSlice,
  audioBufferSlice
};

export default AudioTools;
