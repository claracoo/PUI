/*
This entire file controls the recoridng, saving and processing of the sound information
It is where the majority of the app's functionality comes from
*/


URL = window.URL || window.webkitURL; // library I am using (webkitURL)

var gumStream;                      //stream from getUserMedia() from WebAudioAPI
var rec;                            //Recorder.js object from Recorder CDN API
var input;                          //MediaStreamAudioSourceNode we'll be recording

var AudioContext = window.AudioContext || window.webkitAudioContext; // potential libraries to use
var audioContext //audio context to help us record

//easy to refer to buttons
var recordButton = document.getElementById("recordButton"); // this button and the one below function as the same button that toggle from one another
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");// this button and the one below function as the same button that toggle from one another
var playButton = document.getElementById("playButton");
var pausedAt = 0; // if the pausebutton is in effect, this will mark the time from which it is saved

var analyser; //how we hook up webAudioAPI
var bufferLength; // where we will store how many bytes we are decoding
var dataArray; // where bytes are actually stored
var soundData = [[], [], []]; // where we store the pitch, volume, and timing individually
var fundFreqAbs = 440; // center of a piano
var freqMap  = [fundFreqAbs, 466.16, 493.88, 246.94, 659.25, 554.37, 311.13, 783.99, 349.23, 587.33, 415.3, 622.25, 392, 138.59, 174.61, 196, 783.99, 880, 622.25] // direct steps up and down
var fundFreqIdx = 0; // zero out where fundemental frequencies start at the beginning of every recording
var graphData = {} // where we will populate the data to be sent to the graphing js file

//add events to those 2 buttons (toggled on and off)
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);
playButton.addEventListener("click", pauseRecording);

function startRecording() {
    /* 
    This function starts the recording for the first time and is triggered when the "Record" button is clicked
    It needs to set up the audio context we are going to use and zero out the other data
    */
    var constraints = { audio: true, video:false } // asks browser for permission
    recordButton.style.display = "none"; // toggles record button off
    stopButton.style.display = "block"; // toggles stop button on
    pauseButton.disabled = false // makes pausing available
    document.getElementsByClassName("currentlyRecording")[0].style.display = "flex" // allows recording signifiers to be turned on

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) { // initialize WebAudioAPI here

        audioContext = new AudioContext(); // where each recording's information gets stored during recording process
        // // Connect the source to be analysed
        // assign to gumStream for later use
        gumStream = stream;
        
        analyser = audioContext.createAnalyser(); // where note specific info gets stored
        analyser.fftSize = 2048; //what MIDI's use, standard for most browsers
        bufferLength = analyser.frequencyBinCount; // should be proportional to fft
        dataArray = new Uint8Array(bufferLength); // the bytes of each individual measurement will be stored here, for now just set to empty array where all bytes are 128
        analyser.getByteTimeDomainData(dataArray); // hookup where notes will go to where notes are being read
        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);
        input.connect(analyser); //make sure analyser is hooked up to the byte stream
        pausedAt = 0 // zero out initilal pause to be from the beginning



        /* 
            Create the Recorder object and configure to record mono sound (1 channel)
            Assumes all multi notes will be averaged to the closest key on the piano
        */
        rec = new Recorder(input,{numChannels:1}) // references Recorder class from Recorder CDN API

        //start the recording process
        rec.record()
         
        //take measurements every 100 ms
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
    /*
    This function toggles between pause and resume 
    and makes sure that if there is a pause, it saves when it happened so the time counts stay in order
    */
    if (rec.recording){
        //pause 
        rec.stop();
        pauseButton.style.display = "none";
        playButton.style.display = "block";
        pausedAt = audioContext.currentTime - pausedAt;
    }else{
        //resume
        rec.record()
        pauseButton.style.display = "block";
        playButton.style.display = "none";
       pausedAt = audioContext.currentTime - pausedAt

    }
}

function stopRecording() {
    /*
    This function handles when the current recording session is over
    Not only does it stop the connection to the Record CDN API,
    it calls all of the analyser's properties and sends the information to graph.js
    */

    //disable the stop button, enable the record too allow for new recordings
    recordButton.style.display = "block"; // turn back on record button
    stopButton.style.display = "none"; // toggle off stop button
    document.getElementsByClassName("currentlyRecording")[0].style.display = "none" // recording signifiers are off
    document.getElementById("noRecordingsYet").style.display = "none" // when we add new info to a graph, the graph is assumed to be on, so we shut off the default one
    document.getElementsByClassName("listSection")[0].style.padding = "15px"
    pauseButton.disabled = true; // if we are not recording, we cannot pause

    //reset button just in case the recording is stopped while paused
    pauseButton.style.display = "block"; //set even disabled button back to pause
    playButton.style.display = "none"; //toggle off play
    document.getElementById("recordingTime").innerHTML = "0:00s" // set invisible recording time to 0
    
    //tell the recorder to stop the recording
    rec.stop();

    //stop microphone access
    gumStream.getAudioTracks()[0].stop();
    let id = Date.now() // set arbitrary id for referencing purposes
    graphData[`${id}`] = {} // init empy object with that id so that we add info into it
    //create the wav blob and pass it on to createDownloadLink
    console.log(document.getElementsByClassName("listSection")[0].style)
    rec.exportWAV(createDownloadLink); // turn it into a physical recording, stored temporarily
    setupDataForGraph(id) // put into data format the graph knows how to handle
    processMultGraphs(graphData)
    soundData = [[], [], []]
}

function setupDataForGraph(id) {
    /*
    The graph is only able to handle data when each type of data is inserted into separate arrays, where the index across all data arrays belong to one data point
    currently, soundData is organized by having each data point as one small array, where the format looks like this:
    [note, volume, time]
    meaning the greater soundData looks like:
    [[note, volume, time], [note, volume, time], ... [note, volume, time]]
    */

    graphData[id] = {"x": [], "y": [], "notes": [], "colors": [], "formattedTime": []} // format how the data will need to be entered
    for (let soundSet of soundData) { //for each inner array (representing one reading) of the data, place it into the buckets created above
        if (soundSet.length != 0 && soundSet[1] != 0) { // if there is no data or the volume is 0, we do not need to graph them
            let note = findNote(soundSet[0])[0] // get the literal note on the piano
            let color = findNote(soundSet[0])[1] // get the color we are associating with that note
            graphData[id]["notes"].push(note) // add to notes array
            graphData[id]["colors"].push(color) // add to colors array
            graphData[id]["y"].push(soundSet[1]) // add to volume array
            graphData[id]["x"].push(soundSet[2]) // add to timing array
            graphData[id]["formattedTime"].push(getTimerCount(soundSet[2])) // add to how we actually want to print time min:seconds
        }
    }
}

function findNote(fundFreq){
    /*
    In this function we are taking the fundemental frequency and turning it into a real note we would see in piano sheet music
    from the note, we are also figuring out which color we want to associate with it
    it will return in the form:
    [note, color]
    */
    let a4 = 440 // piano center
    let c0 = a4*Math.pow(2, -4.75) // middle c
    let noteName = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] // notes we want to use
    let colorToNote = {"C": "#FFAEC6", "C#": "#FFC6EC", "D": "#FD85FF", "D#": "#D49EFF", "E": "#809AF6", "F": "#A4CEFF", "F#": "#ACF5FF", "G": "#80FCED", "G#": "#ADF3C9", "A": "#EAFFC8", "A#": "#FFFCB2", "B": "#FFDCA7"} //associated colors
    
    let h = Math.floor(12 * Math.log2(fundFreq/c0)) // universla pitch
    let octave = (h / 12).toFixed(0) // how high or low we are
    let n = h % 12 // exact pitch
    return [noteName[n] + String(octave), colorToNote[noteName[n]]] //using pitch to get exact note at a particular highness/lowness and associating with a color
}


function createDownloadLink(blob) {
    /* 
    How we create the literal visual audio blob
    In this function, we hook up the id of the data to the id of the object in the list of records
    We add the other information to the list item and make it selectable
    */

    let potentialIds = Object.keys(graphData) // get all of the ids we have saved in graphData
    for (let i in potentialIds) potentialIds[i] = Number(potentialIds[i]) // turn into numbers we can use
    let id = Math.max.apply(null, potentialIds) // get the newest id (the most recent) <-- remeber all ids are the exact time, meaning the highest id will be the most recent
    let currRecordsPresent = document.getElementById("recordingsList").childNodes.length; // get how many recordings there currently are
    var url = URL.createObjectURL(blob); // turn audio into source-able data
    //This list item will contain the audio strip for the newest addition and will add it visually to the list of recordings
    let li = `<li style="display: flex; margin-bottom: 1px;">
                    <input type="checkbox" id=${id} name=${id} value=${id} style="margin-top: 18px; margin-right: 5px;" checked="true" onclick="showGraphOnSelect(this.id)">
                    <label for=${id} class="recordInList">
                        <img src="../Assets/images/cover.png" style="width: 44px;">
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
    /*
    This function takes the set of bytes and outputs the particular fundemental frequency they output
    different combos of bytes yield different things -->  lack of a note will mean all 2048 bytes are 128
    */

    var n = 1024, bestR = 0, bestK = -1; // assume 10 to the power of 10 for note, where period is 0 and key is not yet set
    for(var k = 8; k <= 1000; k++){ // induction domain
        var sum = 0;
        
        for(var i = 0; i < n; i++){ //iterate thru byte set
            sum += ((buffer[i] - 128) / 128) * ((buffer[i + k] - 128) / 128); // find how far off it is from key
        }
        
        var r = sum / (n + k); // if it is perfectly in tune it will be 0

        if(r > bestR){ //if the real r is bigger than period than reset period and key
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
    /* 
    We need to determine if more data than one channel is being processed, if so, it should compare to the previous byte set and return the resulting pitch
    */

    var pitch = 0; // init var
    if (fundFreqIdx >= freqMap.length - 1) fundFreqIdx = 0 // if the fund freq we are on is way behind the most recent frequency, reinit
    else fundFreqIdx += 1 //otherwise move index
    if (fundamentalFreq < 0) {
        pitch = findFundamentalFreq(buffer, fundamentalFreq + freqMap[fundFreqIdx]) // if the frequency is less than 0, assume that it is the most recent pitch
    }
    else {
        pitch = findFundamentalFreq(buffer, fundamentalFreq - freqMap[fundFreqIdx]) // otherwise assume it is the last pitch plus the new pitches
    }
    return pitch
}


var detectPitch = function () {
    /* 
    Where the magic actually happens and pitch and volume are both detected
    where data gets added in arrays to soundData
    */
    if (analyser) { // precautionary, if analyser is on
    var buffer = new Uint8Array(analyser.fftSize); //initialize new buffer to read from
    analyser.getByteFrequencyData(buffer) // fill buffer with info from analyser
    let volume = Math.max.apply(null, buffer) // get the greatest volume
    if (volume > 100) volume /= 4; // divide by octaves we are using
    analyser.getByteTimeDomainData(buffer); //find time info from buffer
    var fundamentalFreq = findFundamentalFreq(buffer, audioContext.sampleRate); // get fundemental frequency from the buffer
    // console.log(fundamentalFreq, typeof fundamentalFreq);
    if (fundamentalFreq > -1 && fundamentalFreq < 6000) soundData.push([fundamentalFreq, volume, audioContext.currentTime - pausedAt]) // if the notes are clean, automatically add them to the soundData
    else {
        pitch = determineIfMultNotes(buffer, fundamentalFreq) //figure out fo the notes are clashing
        if (pitch != -1) soundData.push([pitch, volume, audioContext.currentTime - pausedAt]) // if there was sound, add the unclashed notes
        else soundData.push([0, 0, audioContext.currentTime - pausedAt]) //otherwise there was no sound
    }
    let timeAsStr = String((audioContext.currentTime - pausedAt).toFixed(1)) // get string version of time to check when beeper should be on
    if (timeAsStr[timeAsStr.length - 1] == "5") document.getElementById("recordingBeeper").style.display = "none" // turn beeper off every half a second
    if (timeAsStr[timeAsStr.length - 1] == "0") document.getElementById("recordingBeeper").style.display = "block" // turn beeper on every half a second
    document.getElementById("recordingTime").innerHTML = getTimerCount(Math.floor(audioContext.currentTime - pausedAt)); //put nicely formatted time to screen
}
};

function getTimerCount(time) {
    /*
    The time is currently in seconds, meaning that 3 minutes 14 seconds, looks like 194 seconds
    so... lets put it in human readable time
    */
    let minutes = Math.floor(time / 60); // get number of times 60 seconds have passed
    let seconds = Math.floor(time % 60); // see how much is left over
    let formatted = minutes + ":" + seconds + "s" // put them in nice string
    if (seconds < 10) formatted = minutes + ":0" + seconds + "s" //account for if seconds is single digits
    return formatted
}
