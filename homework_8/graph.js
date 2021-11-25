function displayGraph(x, y, notes, colors, timeFormattted, title, id){
  // if (document.getElementById(id) == null) {
  //   console.log("um")
  //   let newDiv = document.createElement("div");
  //   newDiv.id = id
  //   console.log(newDiv)
  //   document.getElementsByClassName("graphSection")[0].insertAdjacentHTML("beforeend", newDiv);
  //   console.log(document.getElementsByClassName("graphSection")[0])
  // }
  // else {
  //   if (document.getElementById("zeroState").display.style == "none") document.getElementById("zeroState").style.display = "block"
  // }
  // console.log(document.getElementById(id))
d3.csv(
    "https://raw.githubusercontent.com/plotly/datasets/master/job-automation-probability.csv",
    function(rows) {
  
      Plotly.newPlot(`${id}`, {
        data: [
          {
            type: "scatter",
            mode: "markers",
    x: x,
    y: y,
   text: notes,
   customdata: timeFormattted,
            marker: { size: 10, color: colors},
            hovertemplate:
              "<b>%{text}</b><br><br>" +
              "%{y:,.0f} Db<br>" +
              "%{customdata}" +
              "<extra></extra>"
          }
        ],
        layout: {
            height: 320,
          title: title,
          hovermode: "closest",
          hoverlabel: { bgcolor: "#FFF" },
          legend: {orientation: 'h', y: -0.3},
          xaxis: {
            title: "Time (s)",
            zeroline: false
          },
          yaxis: {
            title: "Volume (Db)",
            zeroline: false
          }
        },
        config: { responsive: true }
      });
    }
  );
}
  

function processMultGraphs(graphData) {
    let div = document.getElementsByClassName("graphSection")[0];
    if (document.getElementById("zeroState")) document.getElementById("zeroState").style.display = "none"
    let count = 1
    for (let id of Object.keys(graphData)) {
        let newGraph = document.createElement("div");
        newGraph.id = "graph_" + id;
        div.appendChild(newGraph)
        displayGraph(graphData[id]["x"], graphData[id]["y"], graphData[id]["notes"], graphData[id]["colors"], graphData[id]["formattedTime"], `Your Recording ${count}`, newGraph.id)
        count +=  1
    }
}