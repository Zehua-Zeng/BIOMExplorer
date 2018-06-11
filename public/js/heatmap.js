function heatmap(timeData) {

    var itemWidth = 88,
    itemHeight = 22;
    cellWidth = itemWidth - 1,
    cellHeight = itemHeight - 1,
    margin = {top: 10, right: 20, bottom: 20, left: 80};
    
    //var formatDate = d3.time.format("%Y-%m-%d");
    
    console.log(timeData);

    var width = 1000 - margin.right - margin.left,
        height = timeData.length * itemHeight;

    var data = [];
    timeData.forEach(function(d) {
        //console.log(d.x.length);
        for (var i = 0; i < d.x.length; i ++) {
            var newItem = {};
            newItem.day = d.x[i];
            newItem.id = d.id;
            newItem.value = d.y[i];
            data.push(newItem);
        }
    })

    console.log(data);

    //x_elements = d3.set(data.map(function( item ) { return item.day; } )).values()
    //var x_elements = timeData[0]['x'],
    var x_elements = timeData[0]['x'],
        y_elements = d3.set(data.map(function( item ) { return item.id; } )).values();

    console.log(x_elements);
    console.log(y_elements);

    var xScale = d3.scale.ordinal()
        .domain(x_elements)
        .rangeBands([0, x_elements.length * itemWidth]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickFormat(function (d) {
            return d;
        })
        .orient("top");

    var yScale = d3.scale.ordinal()
        .domain(y_elements)
        .rangeBands([0, y_elements.length * itemHeight]);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .tickFormat(function (d) {
            return d;
        })
        .orient("left");

    var svg = d3.select('.timeseries')
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        //.attr("transform", "translate(" + margin.left + ", -40)");
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var cells = svg.selectAll('rect')
        .data(data)
        .enter().append('g').append('rect')
        .attr('class', function(d){
            return d.id + '_cell';
        })
        .attr('width', cellWidth)
        .attr('height', cellHeight)
        .attr('y', function(d) { return yScale(d.id); })
        .attr('x', function(d) { return xScale(d.day); })
        .attr('fill', function(d) {
            if (d.id.startsWith('c-')) {
                return color1c(Math.sqrt(Math.sqrt(d.value)));
            } else if (d.id.startsWith('p-')) {
                return color1p(Math.sqrt(Math.sqrt(d.value)));
            }
        })
        .on("mouseover", function(d) {
            console.log(d.id);
            treeHighlight(d.id);
        })
        .on("mouseout", function(d) {
            console.log(d.id);
            treeHighlightRemove(d.id);
        });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .selectAll('text')
        .attr('font-weight', 'normal');

    d3.select('#TSheader')
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", 40)
      .append("g")
      .attr("transform", "translate(" + margin.left + ", 30)")
      .attr("class", "x axis")
      .call(xAxis)
      .selectAll('text')
      .attr('font-weight', 'normal')
      .style("text-anchor", "start")
      .attr("dx", ".8em")
      .attr("dy", ".5em")
      .attr("transform", function (d) {
          return "rotate(-65)";
      });

    d3.select("#heatmapT1").on("change", function(){
        var s1 = document.getElementById("heatmapT1");
        var s2 = document.getElementById("heatmapT2");
        idx1 = s1.options[s1.selectedIndex].value;
        idx2 = s2.options[s2.selectedIndex].value;
        console.log(idx1, idx2);
        zoom(node);
        console.log(timeData);
        updateBarChart(timeData);
    });

    d3.select("#heatmapT2").on("change", function(){
        var s1 = document.getElementById("heatmapT1");
        var s2 = document.getElementById("heatmapT2");
        idx1 = s1.options[s1.selectedIndex].value;
        idx2 = s2.options[s2.selectedIndex].value;
        console.log(idx1, idx2);
        zoom(node);
        updateBarChart(timeData);
    });
}