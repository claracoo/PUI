/*
How the graphs will be handled and will look
*/

function displayGraph(x, y, notes, colors, timeFormattted, title, id, height){
  /*
  This function uses plotly.js and d3 libraries to create a scatter plot with the information of the 
  timing (x), nicely written with timeFormatted
  volume (y)
  notes with associated color
  a particular title and id
  manipulated height if there are multiple graphs
  */
d3.csv(
    "https://raw.githubusercontent.com/plotly/datasets/master/job-automation-probability.csv", //d3 csv file we are referencing
    function(rows) {
  
      Plotly.newPlot(`${id}`, { // where to insert into HTML
        data: [
          {
            type: "scatter",
            mode: "markers",
    x: x, // timing
    y: y, // volume
   text: notes, //literal note
   customdata: timeFormattted, // nicely stated time
            marker: { size: 10, color: colors}, // how the dots will look
            hovertemplate: // what happens when you hover over a dot, should show the note, the volume and what time it happened, rounded to the nearest second
              "<b>%{text}</b><br><br>" +
              "%{y:,.0f} Db<br>" +
              "%{customdata}" +
              "<extra></extra>"
          }
        ],
        layout: {
            height: height, // changes if there are multiple graphs
            // width: 320,
          title: title, //will be of the format "Your Recording [some number]"
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
        config: { responsive: true } // allow scaling
      });
    }
  );
}
  

function processMultGraphs(graphData) {
    /*
    This allows the multiple graphs to be displayed on top of each other
    passes the information from app.js to the graph rendering function
    */
    let div = document.getElementsByClassName("graphSection")[0]; //figures out where new graph will go
    if (document.getElementById("zeroState")) document.getElementById("zeroState").style.display = "none" // if this is the first graph, will hide default graph
    let count = 1 // set up title
    let height = 320 // assume there is only one graph, so fill whole div
    if (Object.keys(graphData).length > 1) height = 260 // if not only graph show more of div
    for (let id of Object.keys(graphData)) { // for each set of data make a new graph
        let newGraph = document.createElement("div"); // make new div for displayGraph to reference
        newGraph.id = "graph_" + id; // give referenceable id
        newGraph.classList.add("graphs"); // add formatting class name
        div.appendChild(newGraph) // add to larger div
        displayGraph(graphData[id]["x"], graphData[id]["y"], graphData[id]["notes"], graphData[id]["colors"], graphData[id]["formattedTime"], `Your Recording ${count}`, newGraph.id, height) //actually render graph
        count +=  1 //increase count, so title will increase
    }
}