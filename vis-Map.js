/**
 * a helper function to put basic elements on the mapSVG.
 */
var initialiseMap = function () {
    var mapSVG = d3.select("#mapSVG");

    var legendPosX = 500;
    var legendPosY = 600;
    var defs = mapSVG.append("defs");

    var linearGradient = defs.append("linearGradient").attr("id", "linear-gradient");
    linearGradient
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    linearGradient.selectAll("stop")
      .data( studentColourScale.range() )
      .enter().append("stop")
      .attr("offset", function(i) { return i/(studentColourScale.range().length-1); })
      .attr("stop-color", function(d) { return d; });
    mapSVG.append("rect")
      .attr("x", legendPosX)
      .attr("y", legendPosY)
      .attr("width", 300)
      .attr("height", 20)
      .style("fill", "url(#linear-gradient)");
    mapSVG.append("text")
      .attr("x", legendPosX)
      .attr("y", legendPosY+35)
      .text("0");
    mapSVG.append("text")
      .attr("x", legendPosX+280)
      .attr("y", legendPosY+35)
      .text("500 Students");
    mapSVG.append("text")
      .attr("x", legendPosX+140)
      .attr("y", legendPosY+35)
      .text("250");
    mapSVG.append("rect")
      .attr("x", legendPosX+125)
      .attr("y", legendPosY-50)
      .attr("width", 50)
      .attr("height", 20)
      .style("fill", "red");
    mapSVG.append("text")
      .attr("x", legendPosX+100)
      .attr("y", legendPosY-15)
      .text("30000 Students");
}

/**
 * The main function to append map onto the svg we created
 * @param {int} currYear the year we would like to display on the map
 * @param {Array} data the array of data that we would like to visualise
 */
var drawMap = function (currYear, data) {
  var svg = d3.select("#mapSVG");
	var projection = d3.geoAlbersUsa()
					   .scale([mapSVGWidth]);

	var path = d3.geoPath()
         .projection(projection);
         
  var mapTip = d3.tip()
         .attr('class', 'd3-tip')
         .offset([-5, 0])
         .html((d) => {
            return d.properties.name;
         });
  svg.call(mapTip);

	d3.json("us-states.json").then(function(json) {
		for (var i = 0; i < data.length; i++) {
      if (data[i].Year != currYear) { continue; }
      var dataState = data[i].State;
      var dataTotal = data[i].Total;
      for (var j = 0; j < json.features.length; j++) {
        var jsonState = json.features[j].properties.name;
        if (jsonState == dataState) {
            json.features[j].properties.total = dataTotal;
            break;
        }
      }
    }
     
		svg.selectAll("path")
          .data(json.features)
          .enter()
          .append("path")
          .attr("d", path)
            .style("stroke", "white")
            .style("stroke-width", "1")
            .style("fill", function(d) {
                var value = d.properties.total;
                if (value < 500) { return studentColourScale(value); }
                else { return "red"; }
            })
            .on("mouseover", function(d) {
                d3.select(this)
                  .attr("opacity", 0.7);
                mapTip.show(d);
            })
            .on("mouseout", function(d) {
                d3.select(this)
                  .attr("opacity", 1);
                mapTip.hide(d);
            })
            .on("click", function(d) {
              try {
                changeVisibility(d.properties.name.replace(/[^a-zA-Z]/g, ""));
              } catch {
                alert("No available data for this state");
              }
            });
 	});
};