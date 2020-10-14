var mapSvg;
var lineSvg;
var lineWidth;
var lineHeight;
var lineInnerHeight;
var lineInnerWidth;
var lineMargin = { top: 20, right: 60, bottom: 60, left: 100 };
var mapData;
var timeData;
var coalData;
let toolTip;
var testCountry;
//===============================End of Top===========================



// This runs when the page is loaded
document.addEventListener("DOMContentLoaded", function() {
  mapSvg = d3.select("#map");
  lineSvg = d3.select("#linechart");
  lineWidth = +lineSvg.style("width").replace("px","");
  lineHeight = +lineSvg.style("height").replace("px","");;
  lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
  lineInnerHeight = lineHeight - lineMargin.top - lineMargin.bottom;
//=============Set up Margins and such





  // Load both files before doing anything else
  Promise.all([d3.json("data/africa.geojson"),
               //d3.csv("data/africa_gdp_per_capita.csv")])
               d3.csv("data/africa_gdp_per_capita.csv"),
               d3.csv("data/yearly_co2_emissions_1000_tonnes2.csv")
              ])
          .then(function(values){
    
    mapData = values[0];
    timeData = values[1];
    coalData = values[2];
  //=========End of Load Data===========================================




  // Draw initial map
    //drawMap();
    //drawLineChart("Libya");
    //drawLine2Chart("United States");
    drawLine2Chart("United Kingdom");
  //================End of Startup Calls===================================




  // Update map on change of widgets
   document.getElementById("year-input").addEventListener("change", function(event) {drawMap();});
   document.getElementById("color-scale-select").addEventListener("change", function(event) {drawMap();});
  //==================================End of Event Listeners==================
  }) 
});





function drawLine2Chart(country) {
  //===========Remove Chart If Needed######################################################################
  d3.select("g.lineChart").remove();


  //==========Set Up Data=======================
  let xAxisData; 
  let yAxisData
  // Get datapoints
  let timeLine = coalData;


  //=================Convert Data To Numeric=============
  timeLine.forEach(dataPoint => {
    for(let point in dataPoint) {
          dataPoint[point] = +dataPoint[point]
    }
  });
  //=====================================================


//====================Create a group point and set it to the top left==================
// append group element that the line chart gets appended to:
let g = lineSvg.append("g")
        //.attr("class","lineChart")
        .attr("transform",`translate(${lineMargin.left},${lineMargin.top})`)
        .attr('opacity', '1'); // opacity of elements added onto this element which is currently the line



//============Set up X and Y corrdinates frorm data to Screen Values===================================

        let x = d3.scaleLinear().domain([d3.min(timeLine, d => d["Year"] ), d3.max(timeLine, d => d["Year"] )]) // domain changes the input values 
        // for instance if this is year the min should be min year and max shoud be max year.
        .range([0 , 900]); // range changes the width of the number axis .range([0, innerWidth]);
      // set up y Axis
      let y = d3.scaleLinear().domain([0, d3.max(timeLine, d => d[country] )])
        .range([840,0]); // .range([lineInnerHeight, 0]);
      // attach horizontal lines



  const line = d3.line()
  //.x(d => x(d.Year))
    .x(d => x(d["Year"] || 0)) // pass the second parameter here
    .y(d => y(d[country] || 0)) // pass the line value 
    .curve(d3.curveLinear);
    g.append("path")
    .datum(timeLine)  
    .style("stroke-width","2")
    .style("r", 0)      
    .style("fill","none")
    .style("stroke","black")
    .attr("d", line);



//=============================Setup and Attach Axises======================================================
g.append("g")
  .style("font-size", "14px")
  .attr("font-family", "sans-serif")
  .attr("color", "grey")
  .call(d3.axisLeft(y).tickSize(-lineInnerWidth))
  .call(g => g.select(".domain")
        .remove())
  .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke-opacity", 0.5)
        .attr('opacity', '0.5')
        .attr("stroke-dasharray", "5,10"));
// format and attach bottom axi
g.append("g")
  .attr("class","xAxis")   
  .attr("font-family", "sans-serif")
  .attr("color", "grey")
  .style("font-size", "12px")
  .attr("transform",`translate(0,${lineInnerHeight})`)
  .call(d3.axisBottom(x)
  .ticks(d3.Number)
  .tickFormat(d3.format("0")));
  //========================End Axises=========================================================================




//=========================Line====================================================
// Set values for the line and append and then set strock and such
/*
  const line = d3.line()
  //.x(d => x(d.Year))
  .x(d => x(d["Year"] || 0)) // pass the second parameter here
  .y(d => y(d[country] || 0)) // pass the line value 
  .curve(d3.curveLinear);
g.append("path")
  .datum(timeLine)  
  .style("stroke-width","2")
  .style("r", 0)      
  .style("fill","none")
  .style("stroke","black")
  .attr("d", line);
  */
//=================================================================================





//====================Labels=================================================
// attach x axis label
g.append("text")
.style("fill", "grey")
.style("text-anchor","middle")
.attr("transform",`translate(${lineInnerWidth - 500},${lineInnerHeight + 50})`)
.style("font-size", "22px")
.attr("font-family", "sans-serif")
.text("Year");
// attach y axis label
g.append("text")
.style("fill", "grey")
.attr("dy","-80")
.attr("dx", -120)
.style("font-size", "22px")
.attr("font-family", "sans-serif")
.style("text-anchor","end")
.attr("transform","rotate(-90)")
.text(`GDP for ${country} (based on current USD)`);
//===============End of Labels================================================


}
//========