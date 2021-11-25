
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
var playButton = document.getElementById("playButton");

var analyser;
var bufferLength;
var dataArray;
var timeCount = 0;
var soundData = [[], [], []];
var fundFreqAbs = 440;
var freqMap  = [fundFreqAbs, 466.16, 493.88, 246.94, 659.25, 554.37, 311.13, 783.99, 349.23, 587.33, 415.3, 622.25, 392, 138.59, 174.61, 196, 783.99, 880, 622.25]
var fundFreqIdx = 0;
var currentlySelected = [];
var graphData = {}

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);
playButton.addEventListener("click", pauseRecording);

function startRecording() {
    var constraints = { audio: true, video:false }
    recordButton.style.display = "none";
    stopButton.style.display = "block";
    pauseButton.disabled = false
    document.getElementsByClassName("currentlyRecording")[0].style.display = "flex"

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
          }, 100);
         
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

    //disable the stop button, enable the record too allow for new recordings
    recordButton.style.display = "block";
    stopButton.style.display = "none";
    document.getElementsByClassName("currentlyRecording")[0].style.display = "none"
    document.getElementById("noRecordingsYet").style.display = "none"
    pauseButton.disabled = true;

    //reset button just in case the recording is stopped while paused
    pauseButton.style.display = "block";
    playButton.style.display = "none";
    document.getElementById("recordingTime").innerHTML = "0:00s"
    
    //tell the recorder to stop the recording
    rec.stop();

    //stop microphone access
    gumStream.getAudioTracks()[0].stop();
    let id = Date.now()
    graphData[`${id}`] = {}
    //create the wav blob and pass it on to createDownloadLink
    rec.exportWAV(createDownloadLink);
    setupDataForGraph(id)
    console.log("graphStop", Object.keys(graphData))

    console.log("graph", graphData)
    processMultGraphs(graphData)
    soundData = [[], [], []]
}

function setupDataForGraph(id) {
    console.log(JSON.stringify(soundData))
    graphData[id] = {"x": [], "y": [], "notes": [], "colors": [], "formattedTime": []}
    for (let soundSet of soundData) {
        if (soundSet.length != 0 && soundSet[1] != 0) {
            let note = findNote(soundSet[0])[0]
            let color = findNote(soundSet[0])[1]
            graphData[id]["notes"].push(note)
            graphData[id]["colors"].push(color)
            graphData[id]["y"].push(soundSet[1])
            graphData[id]["x"].push(soundSet[2])
            graphData[id]["formattedTime"].push(getTimerCount(soundSet[2]))
        }
    }
}

function findNote(fundFreq){
    let a4 = 440
    let c0 = a4*Math.pow(2, -4.75)
    let noteName = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    let colorToNote = {"C": "#FFAEC6", "C#": "#FFC6EC", "D": "#FD85FF", "D#": "#D49EFF", "E": "#809AF6", "F": "#A4CEFF", "F#": "#ACF5FF", "G": "#80FCED", "G#": "#ADF3C9", "A": "#EAFFC8", "A#": "#FFFCB2", "B": "#FFDCA7"}
    
    let h = Math.floor(12 * Math.log2(fundFreq/c0))
    let octave = (h / 12).toFixed(0)
    let n = h % 12
    return [noteName[n] + String(octave), colorToNote[noteName[n]]]
}


function createDownloadLink(blob) {
    let potentialIds = Object.keys(graphData)
    for (let i in potentialIds) potentialIds[i] = Number(potentialIds[i])
    console.log(potentialIds)
    let id = Math.max.apply(null, potentialIds)
    console.log(id)
    let currRecordsPresent = document.getElementById("recordingsList").childNodes.length;
    var url = URL.createObjectURL(blob);
    let li = `<li style="display: flex; margin-bottom: 1px;">
                    <input type="checkbox" id=${id} name=${id} value=${id} style="margin-top: 18px; margin-right: 5px;" checked="true" onclick="showGraphOnSelect(this.id)">
                    <label for=${id} class="recordInList">
                        <img src="./images/cover.png" style="width: 44px;">
                        <p>Your Recording ${currRecordsPresent + 1}</p>
                        <div style="width: 65%">
                            <audio controls src=${url} style="height: 40px;"></audio>
                        </div>
                    </label>
                </li>`
    //add the li element to the ol
    recordingsList.insertAdjacentHTML("beforeend", li);
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
    if (fundamentalFreq > -1 && fundamentalFreq < 6000) soundData.push([fundamentalFreq, volume, audioContext.currentTime])
    else {
        pitch = determineIfMultNotes(buffer, fundamentalFreq)
        if (pitch != -1) soundData.push([pitch, volume, audioContext.currentTime])
        else soundData.push([0, 0, audioContext.currentTime])
    }
    let timeAsStr = String(audioContext.currentTime.toFixed(1))
    if (timeAsStr[timeAsStr.length - 1] == "5") document.getElementById("recordingBeeper").style.display = "none"
    if (timeAsStr[timeAsStr.length - 1] == "0") document.getElementById("recordingBeeper").style.display = "block"
    document.getElementById("recordingTime").innerHTML = getTimerCount(Math.floor(audioContext.currentTime));
}
};

function getTimerCount(time) {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);
    let formatted = minutes + ":" + seconds + "s"
    if (seconds < 10) formatted = minutes + ":0" + seconds + "s"
    return formatted
}
