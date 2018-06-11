function d3_xy_chart() {
    
    var width = 1100; //600,  
        height = 650; //380,
        xlabel = "Year"
        ylabel = "Population" 

    var margin = {top: 30, right: 150, bottom: 25, left: 60}, 
        innerwidth = width - margin.left - margin.right,
        innerheight = height - margin.top - margin.bottom;

    function chart(selection) {
        selection.each(function(datasets) {
            console.log(datasets);

            var notShowIds = [];

            if (!document.getElementById("SExculded").checked){

                datasets = datasets.filter(function(d) {
                    var notShow = false;
                    if (cancelList.includes(d.id)) {
                        notShowIds.push(d.id);
                        notShow = true;
                    }

                    for (var key in excludeList) {
                        if (key == d.id){
                            notShowIds.push(d.id);
                            notShow = true;
                            break;
                        }
                        if (excludeList[key].includes(d.id)) {
                            notShowIds.push(d.id);
                            notShow = true;
                            break;
                        }
                    }
                    if (!notShow) {
                        return d;
                    }
                })
            }
            
            //header:
            //d3.select("#TSheader").text("Drashed red lines represent valid dates for dragging");

            //var redLine = d3.select("#redLine");
            //redLine.selectAll("*").remove();
            //redLine = d3.select("#redLine").append("svg")
            //  .attr("height", 3)
            //  .attr("width", 300);
            //
            //redLine.append("line")
            //       .attr("x1", 0)
            //       .attr("y1", 0)
            //       .attr("x2", 200)
            //       .attr("y2", 0)
            //       .attr("stroke-width", 5)
            //       .attr("stroke", "red")
            //       .attr("opacity", 1)
            //       .style("stroke-dasharray", ("3, 3"));


            var x_scale = d3.scale.linear()
                .range([0, innerwidth])
                .domain([ d3.min(datasets, function(d) { return d3.min(d.x); }), 
                          d3.max(datasets, function(d) { return d3.max(d.x); }) ]) ;
            
            var y_scale = d3.scale.sqrt()
                .range([innerheight, 0])
                .domain([ d3.min(datasets, function(d) { return d3.min(d.y); }),
                          d3.max(datasets, function(d) { return d3.max(d.y); }) ]) ;

            var x_axis = d3.svg.axis()
                .scale(x_scale)
                .orient("bottom") 
                .tickFormat(d3.format("d"));


            var y_axis = d3.svg.axis()
                .scale(y_scale)
                .orient("left") 
                .ticks(20, "s");

            var x_grid = d3.svg.axis()
                .scale(x_scale)
                .orient("bottom")
                .tickSize(-innerheight)
                .tickFormat("");

            var y_grid = d3.svg.axis()
                .scale(y_scale)
                .orient("left") 
                .tickSize(-innerwidth)
                .tickFormat("") ;

            var draw_line = d3.svg.line()
                .interpolate("basis")
                .x(function(d) { return x_scale(d[0]); })
                .y(function(d) { return y_scale(d[1]); });

            svg_linechart = d3.select(this).append('svg')
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")") ;
            
            svg_linechart.append("g")
                .attr("class", "x grid")
                .attr("transform", "translate(0," + innerheight + ")")
                .call(x_grid) ;

            svg_linechart.append("g")
                .attr("class", "y grid")
                .call(y_grid) ;

            svg_linechart.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + innerheight + ")") 
                .call(x_axis)
                .append("text")
                .attr("dy", "-.71em")
                .attr("x", innerwidth)
                .style("text-anchor", "end")
                .text(xlabel)
                .style("font-weight", "bold");
            
            svg_linechart.append("g")
                .attr("class", "y axis")
                .call(y_axis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .style("text-anchor", "end")
                .text(ylabel)
                .style("font-weight", "bold");



            //red lines:
            var days = [0, 2, 3, 9, 30];
            //var years = [0, 1, 2, 3, 4, 5, 6];
            for (var i = 0; i < days.length; i ++) {
                svg_linechart.append("line")
                    .attr("x1", days[i] * (innerwidth / 30))
                    .attr("y1", 0)
                    .attr("x2", days[i] * (innerwidth / 30))
                    .attr("y2", innerheight)
                    .attr("stroke-width", 5)
                    .attr("stroke", "red")
                    .attr("opacity", 0.5)
                    .style("stroke-dasharray", ("3, 3"));
            }

            //draggable lines:
            function findClosest(x) {
                var num = x / (innerwidth / 30);
                var days = [0, 2, 3, 9, 30];
                //var years = [0, 1, 2, 3, 4, 5, 6];
                var cloest = 100;
                days.forEach(function(date){
                    if (Math.abs(date - num) < Math.abs(cloest - num)) {
                        cloest = date;
                    }
                });
                //console.log(cloest);
                return cloest * (innerwidth / 30);
            }
            var drag1 = d3.behavior.drag()
                         .on('dragstart', null)
                         .on('drag', function(d){
                            // move circle
                            var dx = d3.event.dx;
                            var xNew = parseFloat(d3.select(this).attr('x1'))+ dx;
                            if (xNew < 0) {
                                line1.attr("x1", 0)
                                    .attr("x2", 0);
                                line1text.attr("x", 0);
                            } else if (xNew > innerwidth) {
                                line1.attr("x1", innerwidth)
                                    .attr("x2", innerwidth);
                                line1text.attr("x", innerwidth);
                            } else {
                                line1.attr("x1", xNew)
                                     .attr("x2", xNew);
                                line1text.attr("x", xNew);
                            }

                        }).on('dragend', function(d){
                            line1X = parseFloat(d3.select(this).attr('x1'));
                            line1X = findClosest(line1X);
                            line1.attr("x1", line1X)
                                 .attr("x2", line1X);
                            line1text.attr("x", line1X);
                            dragDone();
                        }); 

            var drag2 = d3.behavior.drag()
                         .on('dragstart', null)
                         .on('drag', function(d){
                            // move circle
                            var dx = d3.event.dx;
                            var xNew = parseFloat(d3.select(this).attr('x1'))+ dx;
                            if (xNew < 0) {
                                line2.attr("x1", 0)
                                    .attr("x2", 0);
                                line2text.attr("x", 0);
                            } else if (xNew > innerwidth) {
                                line2.attr("x1", innerwidth)
                                    .attr("x2", innerwidth);
                                line2text.attr("x", innerwidth);
                            } else {
                                line2.attr("x1", xNew)
                                     .attr("x2", xNew);
                                line2text.attr("x", xNew);
                            }
                        }).on('dragend', function(d){
                            line2X = parseFloat(d3.select(this).attr('x1'));
                            line2X = findClosest(line2X);
                            line2.attr("x1", line2X)
                                 .attr("x2", line2X);
                            line2text.attr("x", line2X);
                            dragDone();
                        });


            var line1 = svg_linechart.append("line")
                           .attr("x1", line1X)
                           .attr("y1", 0)
                           .attr("x2", line1X)
                           .attr("y2", innerheight)
                           .attr("stroke-width", 4)
                           .attr("stroke", "#01579B")
                           .call(drag1);

            var line1text = svg_linechart.append('text')
                               .attr('x', line1X)
                               .attr('y', -10)
                               .attr("stroke", "#01579B")
                               .text("T1");

            var line2 = svg_linechart.append("line")
                            .attr("x1", line2X)
                            .attr("y1", 0)
                            .attr("x2", line2X)
                            .attr("y2", innerheight)
                            .attr("stroke-width", 4)
                            .attr("stroke", "#1B5E20")
                            .call(drag2);
            var line2text = svg_linechart.append('text')
                               .attr('x', line2X)
                               .attr('y', -10)
                               .attr("stroke", "#1B5E20")
                               .text("T2");


            function dragDone() {
                idx1 = getIndex(Math.round(line1X / (innerwidth / 30)));
                idx2 = getIndex(Math.round(line2X / (innerwidth / 30)));
                console.log(idx1, idx2);
                zoom(node);
                updateBarChart(datasets);
            }

            //console.log(datasets);

            var data_lines = svg_linechart.selectAll(".d3_xy_chart_line")
                .data(datasets.map(function(d) { return d3.zip(d.x, d.y);}))
                .enter().append("g")
                .attr("class", "d3_xy_chart_line");
            
            data_lines.append("path")
                .attr("d", function(d) {return draw_line(d); });
            
            data_lines.select("path")
                      .datum(function(d, i){return datasets[i].id;})
                      .attr("stroke", function(d, i){
                        if (document.getElementById("SExculded").checked && notShowIds.includes(datasets[i].id)) {
                            return cancelColor;
                        }
                        return color_scale(parseInt(datasets[i].id.substring(2)));               
                      })
                      .on("mouseover", function(d, i) {
                        //console.log();
                        treeHighlight(datasets[i].id);
                        d3.select(this).style("stroke-width", "5px");
                        
                      })
                      .on("mouseout", function(d, i) {
                        treeHighlightRemove(datasets[i].id);
                        d3.select(this).style("stroke-width", "2.5px");
                        lockedHighlight();
                      })
                      .on("click", function(d, i) {
                        if (datasets[i].id.startsWith('c-')) {
                            clickC(getNodeByIdCurT(datasets[i].id)[0]);
                        } else {
                            clickP(getNodeByIdCurT(datasets[i].id)[0]);
                        }
                      });

            data_lines.select("path")
                      .datum(function(d, i){return datasets[i].id;})
                      .attr("class", function(d){ return d +'_line line'});

            data_lines.append("text")
                .datum(function(d, i) { return {name: datasets[i].id, final: d[d.length-1]}; }) 
                .attr('class', function(d){return d.name + '_text'})
                .attr("transform", function(d) { 
                    return ( "translate(" + x_scale(d.final[0]) + "," + 
                             y_scale(d.final[1]) + ")" ) ; })
                .attr("x", 3)
                .attr("dy", ".35em")
                .attr("fill", function(d, i) {
                    return color_scale(parseInt(datasets[i].id.substring(2)));
                })
                .attr("display", function(d, i) {
                    if (datasets.length > 50) {
                        return "none";
                    }
                })
                .text(function(d, i) { return datasets[i].name; });

            //slct change:
            d3.select("#brChart").on("change", function() {
                updateBarChart(datasets);
                previewTreeLine([]);
                showTitle();
            });

            if (!document.getElementById("SExculded").checked){

                datasets = datasets.filter(function(d) {
                    var notShow = false;
                    if (cancelList.includes(d.id)) {
                        notShow = true;
                    }

                    for (var key in excludeList) {
                        if (key == d.id){
                            notShow = true;
                            break;
                        }
                        if (excludeList[key].includes(d.id)) {
                            notShow = true;
                            break;
                        }
                    }
                    if (!notShow) {
                        return d;
                    }
                })
            }

            //updateBarChart(datasets);
            
        });
    }


    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.xlabel = function(value) {
        if(!arguments.length) return xlabel ;
        xlabel = value ;
        return chart ;
    } ;

    chart.ylabel = function(value) {
        if(!arguments.length) return ylabel ;
        ylabel = value ;
        return chart ;
    } ;
    
    return chart;

}

function getIndex(num) {
    if (num == 0) {return 0;}
    if (num == 2) {return 1;}
    if (num == 3) {return 2;}
    if (num == 9) {return 3;}
    if (num == 30) {return 4;}
}

function treeHighlight(hid) {
    chart.selectAll(".cell.child")[0].forEach(function(g){
        if (d3.select(g).select('.background')[0][0].classList[0] == hid) {
            //console.log(d3.select(g).select('.background'));
            d3.select(g).select('.background')
              .style("stroke", "#33691E")
              .style("stroke-width", 2.5);
        } else {
            d3.select(g).select('.background')
              .attr('opacity', 0.1);
        }
    })
    chart.selectAll(".cell.parent")[0].forEach(function(p){
        if (d3.select(p).select('rect')[0][0].classList[0] == hid) {
            d3.select(p).select('rect')
              .style("stroke", "#33691E")
              .style("stroke-width", 2.5);
        } else {
            d3.select(p).select('rect')
              .attr('opacity', 0.1);
        }
    })
    lineHighlight(hid);
}

function treeHighlightRemove(hid) {
    chart.selectAll(".cell.child")[0].forEach(function(g){
        if (d3.select(g).select('.background')[0][0].classList[0] == hid) {
            //console.log(d3.select(g).select('.background'));
            d3.select(g).select('.background')
              .style("stroke", "#FFFFFF")
              .style("stroke-width", 1);
        } else {
            d3.select(g).select('.background')
              .attr('opacity', 1);
        }
    })
    chart.selectAll(".cell.parent")[0].forEach(function(p){
        //console.log(d3.select(p).select('rect'));
        if (d3.select(p).select('rect')[0][0].classList[0] == hid) {
            d3.select(p).select('rect')
              .style("stroke", "#FFFFFF")
              .style("stroke-width", 1);
        } else {
            d3.select(p).select('rect')
              .attr('opacity', 1);
        }
    })
    lineHighlightRemove(hid);
}

function getIndex(num) {
    if (num == 0) {return 0;}
    if (num == 2) {return 1;}
    if (num == 3) {return 2;}
    if (num == 9) {return 3;}
    if (num == 30) {return 4;}
}

function treeHighlight(hid) {
    if (hid.startsWith('c-')) {
        chart.selectAll(".cell.child")[0].forEach(function(g){
            if (d3.select(g).select('.background')[0][0].classList[0] == hid) {
                d3.select(g).select('.background')
                  .style("stroke", mouseOverStroke)
                  .style("stroke-width", 2.5);
            } else {
                d3.select(g).select('.background')
                  .attr('opacity', 0.1);
            }
        })
    } else {
        var cList = getAllChildren(getNodeByIdCurT(hid)[0]);
        cList.push(hid);
        chart.selectAll(".cell.parent")[0].forEach(function(p){
            if (d3.select(p).select('rect')[0][0].classList[0] == hid) {
                d3.select(p).select('rect')
                  .style("stroke", mouseOverStroke)
                  .style("stroke-width", 2.5);
            }
        })
        chart.selectAll(".cell.parent")[0].forEach(function(p){
            if (!cList.includes(d3.select(p).select('rect')[0][0].classList[0])) {
                d3.select(p).select('rect')
                  .attr('opacity', 0.1);
            }
        })
        chart.selectAll(".cell.child")[0].forEach(function(g){
            if (!cList.includes(d3.select(g).select('.background')[0][0].classList[0])) {
                d3.select(g).select('.background')
                  .attr('opacity', 0.1);
            }
        })
    }
    lineHighlight(hid);
}

function treeHighlightRemove(hid) {
    chart.selectAll(".cell.child")[0].forEach(function(g){
        if (d3.select(g).select('.background')[0][0].classList[0] == hid) {
            //console.log(d3.select(g).select('.background'));
            d3.select(g).select('.background')
              .style("stroke", mouseOutStroke)
              .style("stroke-width", 1);
        } else {
            d3.select(g).select('.background')
              .attr('opacity', 1);
        }
    })
    chart.selectAll(".cell.parent")[0].forEach(function(p){
        //console.log(d3.select(p).select('rect'));
        if (d3.select(p).select('rect')[0][0].classList[0] == hid) {
            d3.select(p).select('rect')
              .style("stroke", mouseOutStroke)
              .style("stroke-width", 1);
        } else {
            d3.select(p).select('rect')
              .attr('opacity', 1);
        }
    })
    lineHighlightRemove(hid);
}

function drawBarChart(barData) {
    svg_dischart = d3.select("#dischart");
    svg_dischart.selectAll("*").remove();
    dis_chart(barData);
}


function updateBarChart(lineData) {
    console.log(lineData);
    var diff = [];
    var s = document.getElementById("brChart");
    var slct = s.options[s.selectedIndex].value;
    if (slct == "t1v") { 
        lineData.forEach(function(d) {
            diff.push(d['y'][idx1]);
        });
    } else if (slct == "t2v") { 
        lineData.forEach(function(d) {
            diff.push(d['y'][idx2]);
        });
    } else if (slct == "t1t2") { 
        lineData.forEach(function(d) {
            diff.push((d['y'][idx1] - d['y'][idx2]));
        });
    } else if (slct == "t2t1") {
        lineData.forEach(function(d) {
            diff.push(d['y'][idx2] - d['y'][idx1]);
        });
    } else if (slct == "tt12") {
        lineData.forEach(function(d) {
            diff.push(Math.abs(d['y'][idx2] - d['y'][idx1]));
        });
    }
    drawBarChart(diff);
}