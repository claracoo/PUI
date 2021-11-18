function showListTab(decadeStatus, createStatus) {
    let decades = document.getElementsByClassName("listItem");
    for (let dec of decades) {
      dec.style.display = decadeStatus
    }
    document.getElementsByClassName('recordList')[0].style.display = createStatus
  
    if (decadeStatus == 'block') {
      document.getElementsByClassName("tabs_left")[0].style.backgroundColor = "white";
      document.getElementsByClassName("tabs_right")[0].style.backgroundColor = "rgb(214, 214, 214)";
    }
    else {
      document.getElementsByClassName("tabs_right")[0].style.backgroundColor = "white";
      document.getElementsByClassName("tabs_left")[0].style.backgroundColor = "rgb(214, 214, 214)";
    }
  }


function loadHome() {
  displayGraph([], [], [], [], [], "Waiting for Recordings")
}