function displayGraph(x, y, notes, colors, timeFormattted, title){
d3.csv(
    "https://raw.githubusercontent.com/plotly/datasets/master/job-automation-probability.csv",
    function(rows) {
  
      Plotly.newPlot('myDiv', {
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
            height: 350,
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
  