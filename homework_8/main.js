function showGraphOnSelect(id) {
  if (document.getElementById(id).checked) {
    document.getElementById("graph_" + id).style.display = "block"
  }
  else {
    document.getElementById("graph_" + id).style.display = "none"
  }
  let noneShowing = true
  for (let id_label of Object.keys(graphData)) {
    console.log(document.getElementById(id_label).checked)
    if (document.getElementById(id_label).checked){
      noneShowing = false
    } 
  }
  if (noneShowing) {
   document.getElementById("zeroState").style.display = "block"
    loadHome()
  }
  else {
    document.getElementById("zeroState").style.display = "none"
  }
}














// let graphData = []
// function showListTab(decadeStatus, createStatus) {
//     let decades = document.getElementsByClassName("listItem");
//     for (let dec of decades) {
//       dec.style.display = decadeStatus
//     }
//     document.getElementsByClassName('recordList')[0].style.display = createStatus
  
//     if (decadeStatus == 'block') {
//       document.getElementsByClassName("tabs_left")[0].style.backgroundColor = "white";
//       document.getElementsByClassName("tabs_right")[0].style.backgroundColor = "rgb(214, 214, 214)";
//       loadSongs(40)
//     }
//     else {
//       document.getElementsByClassName("tabs_right")[0].style.backgroundColor = "white";
//       document.getElementsByClassName("tabs_left")[0].style.backgroundColor = "rgb(214, 214, 214)";
//     }
//   }


function loadHome() {
  displayGraph([], [], [], [], [], "Waiting for Recordings", "zeroState")
}

function loadDecades() {}

function loadSongs(decade) {
  
  document.getElementById("noRecordingsYet").style.display = "none"
  let decadeInfo = songs["1940s"]
  for (let id in decadeInfo){
    let song = decadeInfo[id]
    if (id > 0) {
      let li = `<li style="display: flex; margin-bottom: 1px;">
                  <input type="checkbox" id=${id} name=${id} value=${id} style="margin-top: 18px; margin-right: 5px;">
                  <label for=${id} class="recordInList">
                      <img src=${song.img} style="width: 44px;">
                      <div class="songLabel">
                        <p >${song.name} - ${song.artist}</p>
                      </div>
                      <div style="width: 65%">
                          <audio controls src=${song.audio} style="height: 40px;"></audio>
                      </div>
                  </label>
              </li>`
      //add the li element to the ol
      recordingsList.insertAdjacentHTML("beforeend", li);
    }
  }
}

function setupPreRecordedForGraph(id) {
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


