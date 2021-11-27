/*
This is where any non sound oriented formatted comes from
Updates the graphs shown on the right half of the screen and sets up what the homescreen looks like before any recordings have been added
*/

function showGraphOnSelect(id) {
  /*
  This function adds graphs when new recordings have been added
  New recordings automatically get added to the back of the list
  but this function allows you to toggle on and off the graphs present
  */
  if (document.getElementById(id).checked) { //if the selected graph has just been turned on, show associated graph
    document.getElementById("graph_" + id).style.display = "block"
  }
  else { //if the selected graph has just been turned off, hide associated graph
    document.getElementById("graph_" + id).style.display = "none"
  }
  let noneShowing = true //assume there are none showing
  for (let id_label of Object.keys(graphData)) { // figure out if even one graph is showing
    if (document.getElementById(id_label).checked){
      noneShowing = false
    } 
  }
  if (noneShowing) { //if no graph is showing, show default graph
   document.getElementById("zeroState").style.display = "block"
    loadHome() //how homescreen will look when no recordings are added
  }
  else {
    document.getElementById("zeroState").style.display = "none"
  }
}


function loadHome() {
/*
This function loads an empty graph while the user does not put in any recordings
*/
  displayGraph([], [], [], [], [], "Waiting for Recordings", "zeroState", 320)
}
