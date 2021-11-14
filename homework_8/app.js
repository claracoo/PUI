
//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;
// const Pitchfinder = requirejs("pitchfinder");
// let WavDecoder = requirejs('wav-decoder')

var gumStream;                      //stream from getUserMedia()
var rec;                            //Recorder.js object
var input;                          //MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");

var analyser;
var bufferLength;
var dataArray;
var timeCount = 0;
var soundData = [];
var fundFreqAbs = 440;
var freqMap  = [fundFreqAbs, 466.16, 493.88, 246.94, 659.25, 554.37, 311.13, 783.99, 349.23, 587.33, 415.3, 622.25, 392, 138.59, 174.61, 196, 783.99, 880, 622.25]
var fundFreqIdx = 0;

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);

function startRecording() {
    var constraints = { audio: true, video:false }
    recordButton.style.display = "none";
    stopButton.style.display = "block";
    pauseButton.disabled = false
    console.log(stopButton, recordButton)

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        // console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

        audioContext = new AudioContext();
        // // Connect the source to be analysed
        /*  assign to gumStream for later use  */
        gumStream = stream;
        
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);
        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);
        input.connect(analyser);


        /* 
            Create the Recorder object and configure to record mono sound (1 channel)
            Recording 2 channels  will double the file size
        */
        rec = new Recorder(input,{numChannels:1})

        //start the recording process
        rec.record()

        setInterval(function() {
            if (rec.recording) {
                detectPitch()
            }
          }, 50);
         
    }).catch(function(err) {
        //enable the record button if getUserMedia() fails
        recordButton.disabled = false;
        stopButton.disabled = true;
        pauseButton.disabled = true
    });
}

function pauseRecording(){
    console.log("pauseButton clicked rec.recording=",rec.recording );
    if (rec.recording){
        //pause
        rec.stop();
        pauseButton.style.display = "none";
        playButton.style.display = "block";
    }else{
        //resume
        rec.record()
        pauseButton.style.display = "block";
        playButton.style.display = "none";

    }
}

function stopRecording() {
    console.log("stopButton clicked");

    //disable the stop button, enable the record too allow for new recordings
    recordButton.style.display = "block";
    stopButton.style.display = "none";
    pauseButton.disabled = true;

    //reset button just in case the recording is stopped while paused
    pauseButton.innerHTML="Pause";
    
    //tell the recorder to stop the recording
    rec.stop();

    //stop microphone access
    gumStream.getAudioTracks()[0].stop();

    //create the wav blob and pass it on to createDownloadLink
    rec.exportWAV(createDownloadLink);
    console.log("pitches", soundData);
}

function createDownloadLink(blob) {
    // requirejs(["wav-decoder"], function (WavDecoder) {
    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    var li = document.createElement('li');
    var link = document.createElement('a');
//  loadSample(url)
//   .then(sample => playSample(sample));
    //name of .wav file to use during upload and download (without extendion)
    var filename = new Date().toISOString();

    //add controls to the <audio> element
    au.controls = true;
    au.src = url;

    //save to disk link
    link.href = url;
    link.download = filename+".wav"; //download forces the browser to donwload the file using the  filename
    link.innerHTML = "Save to disk";

    //add the new audio element to li
    li.appendChild(au);
    
    //add the filename to the li
    li.appendChild(document.createTextNode(filename+".wav "))

    //add the save to disk link to li
    li.appendChild(link);


    //add the li element to the ol
    recordingsList.appendChild(li);
};


var findFundamentalFreq = function(buffer, sampleRate) {
    var n = 1024, bestR = 0, bestK = -1;
    for(var k = 8; k <= 1000; k++){
        var sum = 0;
        
        for(var i = 0; i < n; i++){
            sum += ((buffer[i] - 128) / 128) * ((buffer[i + k] - 128) / 128);
        }
        
        var r = sum / (n + k);

        if(r > bestR){
            bestR = r;
            bestK = k;
        }

        if(r > 0.9) {
            // Let's assume that this is good enough and stop right here
            break;
        }
    }
    
    if(bestR > 0.0025) {
        // The period (in frames) of the fundamental frequency is 'bestK'. Getting the frequency from there is trivial.
        var fundamentalFreq = sampleRate / bestK;
        return fundamentalFreq;
    }
    else {
        // We haven't found a good correlation
        return -1;
    }
};

function determineIfMultNotes(buffer, fundamentalFreq) {
    var pitch = 0;
    if (fundFreqIdx >= freqMap.length - 1) fundFreqIdx = 0
    else fundFreqIdx += 1
    if (fundamentalFreq < 0) {
        pitch = findFundamentalFreq(buffer, fundamentalFreq + freqMap[fundFreqIdx])
    }
    else {
        pitch = findFundamentalFreq(buffer, fundamentalFreq - freqMap[fundFreqIdx])
    }
    return pitch
}


var frameId;
var detectPitch = function () {
    if (analyser) {
    var buffer = new Uint8Array(analyser.fftSize);
    // See initializations in the AudioContent and AnalyserNode sections of the demo.
    analyser.getByteFrequencyData(buffer)
    let volume = Math.max.apply(null, buffer)
    if (volume > 100) volume /= 4;

    analyser.getByteTimeDomainData(buffer);

    var fundamentalFreq = findFundamentalFreq(buffer, audioContext.sampleRate);
    // console.log(fundamentalFreq, typeof fundamentalFreq);
    if (fundamentalFreq > -1 && fundamentalFreq < 6000) soundData.push([fundamentalFreq, volume, timeCount])
    else {
        pitch = determineIfMultNotes(buffer, fundamentalFreq)
        if (pitch != -1) soundData.push([pitch, volume, timeCount])
        else soundData.push([0, 0, timeCount])
    }
    timeCount += 1;
}
};
