function drawMulLinechart() {
	var timeList = [];
	curTime.forEach(function(t) {
		timeList.push(t.id);
	})

	console.log(timeList);

	var mulDataset = {};

	timeList.forEach(function(t) {
		mulDataset[t] = {};
		mulDataset[t][0] = []; //NAIVE
		mulDataset[t][1] = []; //SHAM
		mulDataset[t][2] = []; //TBI
		mulDataset[t]['max'] = 0;

		if (t.startsWith("c-")) {
			var tmpMax = 0;
			for (var feat in timeData[t]) {
				if (feat == "total") {
					continue ;
				}
		    	var tmpY = [0, 0, 0, 0, 0];
		    	for (var i = 0; i < tmpY.length; i ++) {
		    		tmpY[i] += timeData[t][feat][i];
		    		if (tmpY[i] > tmpMax) {
		    			tmpMax = tmpY[i];
		    		}
		    	}
		    	var tmpLine = {"x": [-2, 0, 1, 7, 28], "y": tmpY, "name": feat};

		    	if (feat.search("NAIVE") != -1) {
		    		mulDataset[t][0].push(tmpLine);
		    	}
		    	if (feat.search("SHAM") != -1) {
		    		mulDataset[t][1].push(tmpLine);
		    	}
		    	if (feat.search("TBI") != -1) {
		    		mulDataset[t][2].push(tmpLine);
		    	}
		    }
		    mulDataset[t]["max"] = tmpMax;

		} else {
			var pRate = getPRate(t);
			var tmpMax = 0;
			for (var feat in pRate) {
				var tmpY = [0, 0, 0, 0, 0];
			    for (var i = 0; i < tmpY.length; i ++) {
			    	tmpY[i] += pRate[feat][i];
			    	if (tmpY[i] > tmpMax) {
		    			tmpMax = tmpY[i];
		    		}
			    }
			    var tmpLine = {"x": [-2, 0, 1, 7, 28], "y": tmpY, "name": feat};

			    if (feat.search("NAIVE") != -1) {
		    		mulDataset[t][0].push(tmpLine);
		    	}
		    	if (feat.search("SHAM") != -1) {
		    		mulDataset[t][1].push(tmpLine);
		    	}
		    	if (feat.search("TBI") != -1) {
		    		mulDataset[t][2].push(tmpLine);
		    	}
			}
			mulDataset[t]["max"] = tmpMax;
		}

	})

	console.log(mulDataset);

	var svg_mul = d3.select(".timeseries");

	for (var key in mulDataset) {
		for(var i = 0; i < 3; i ++) {
			var tmp_svg = svg_mul.append("svg");
			var singleChart = singleLineChart()
			                .maxAxis(mulDataset[key]["max"]);

			tmp_svg.datum(mulDataset[key][i])
			       .call(singleChart);
		}

		var tmp_text = svg_mul.append("svg")
		                      .attr("width", 50)
		                      .attr("height", 200)
		                      .append("text")
		                      .attr("x", 0)
		                      .attr("y", 90)
		                      .text(key);
	}

	var animals = ["A:1.1", "A:1.2", "A:1.3", "A:1.4", "A:1.5", "A:2.1", "A:2.2", "A:2.3", "A:2.4", "A:2.5", "A:3.1", "A:3.2", "A:3.3", "A:3.4", "A:3.5", "A:4.1", "A:4.2", "A:4.3", "A:4.4", "A:4.5", "A:5.1", "A:5.2", "A:5.3", "A:5.4", "A:5.5"]

	var svg_legend = d3.select("#TSheader");

	var animal_legend = svg_legend.append("svg")
                          .attr("width", 600)
                          .attr("height", 160)
                          .attr("class", "mul_legend")
	                      .selectAll("g").data(animals).enter().append('g');

	var legned_rect = animal_legend.append('rect')
	                            .attr('x', function(d, i) {
	                            	return 100 * (i % 5) + 50;
	                            })
	                            .attr('y', function(d, i) {
	                            	return 30 * Math.floor(i / 5) + 10;
	                            })
	                            .attr('width', 18)
	                            .attr('height', 18)
	                            .attr('fill', function(d, i) {
	                            	return getStrokeColor(d);
	                            })
	                            .attr("class", "legned_rect");

	var legned_text = animal_legend.append('text')
	                            .attr('x', function(d, i) {
	                            	return 100 * (i % 5) + 73;
	                            })
	                            .attr('y', function(d, i) {
	                            	return 30 * Math.floor(i / 5) + 25;
	                            })
	                            .text(function(d, i) {
	                            	return d;
	                            });

	var cages = ["C:1", "C:2", "C:3", "C:4", "C:5"];

	var cage_legend = svg_legend.append("svg")
	                            .attr("width", 400)
	                            .attr("height", 150)
	                            .attr("class", "mul_legend")
	                            .selectAll("g").data(cages).enter().append('g');

	var legend_line = cage_legend.append("line")
	                             .attr("x1", 50)
	                             .attr("y1", function(d, i) {
	                             	return 30 * i + 20;
	                             })
	                             .attr("x2", 150)
	                             .attr("y2", function(d, i) {
	                             	return 30 * i + 20;
	                             })
	                             .attr("stroke-width", 3)
	                             .attr("stroke", "#000000")
	                             .style("stroke-dasharray", function(d, i) {
	                             	return (getStrokeDash(d));
	                             });


	var legned_text_2 = cage_legend.append("text")
	                               .attr("x", 170)
	                               .attr("y", function(d, i) {
	                               	   return 30 * i + 22;
	                               })
	                               .text(function(d, i) {
	                               	   return d;
	                               });

	var treatments = ["NAIVE", "SHAM", "TBI"];

	var treatment_svg = svg_legend.append("svg")
	                              .attr("width", 1100)
	                              .attr("height", 30)
	                              .attr("class", "mul_legend")
	                              .selectAll("g").data(treatments).enter().append('g');

	var legend_text_3 = treatment_svg.append("text")
	                                 .attr("x", function(d, i) {
	                                 	return i * 300 + 150;
	                                 })
	                                 .attr("y", 22)
	                                 .text(function(d, i) {
	                                 	return d;
	                                 })
}

function getPRate(id) {
	var tmpChildren = getAllChildren(getNodeByIdCurT(id)[0]);

	pRate = {};

	tmpChildren.forEach(function(c) {
		if (c.startsWith("c-")) {
			var cRate = timeData[c];
			for (var key in cRate) {
				if (key == "total") {
					continue ;
				}
				if (pRate.hasOwnProperty(key)) {
					for (var i = 0; i < pRate[key].length; i ++) {
						pRate[key][i] += cRate[key][i];
					}

				} else {
					var tmp = [0, 0, 0, 0, 0];
					for (var i = 0; i < tmp.length; i ++) {
						tmp[i] += cRate[key][i];
					}
					pRate[key] = tmp;
				}
			}
		}
	});

	console.log(pRate);

	return pRate;
}

function singleLineChart() {
	var width = 300,
	    height = 200,
	    xlabel = "Day",
	    ylabel = "Amount",
	    maxAxis;

	function chart(selection) {
		selection.each(function(datasets) {

			//console.log(datasets);

			var margin = {top: 10, right: 10, bottom: 30, left: 50}, 
            innerwidth = width - margin.left - margin.right,
            innerheight = height - margin.top - margin.bottom ;

            var x_scale = d3.scale.linear()
                .range([0, innerwidth])
                .domain([ d3.min(datasets, function(d) { return d3.min(d.x); }), 
                          d3.max(datasets, function(d) { return d3.max(d.x); }) ]) ;

            var y_scale = d3.scale.linear()
                .range([innerheight, 0])
                .domain([0, maxAxis]);


            var x_axis = d3.svg.axis()
                .scale(x_scale)
                .orient("bottom") ;

            var y_axis = d3.svg.axis()
                .scale(y_scale)
                .orient("left") ;

            var x_grid = d3.svg.axis()
                .scale(x_scale)
                .orient("bottom")
                .tickSize(-innerheight)
                .tickFormat("") ;

            var y_grid = d3.svg.axis()
                .scale(y_scale)
                .orient("left") 
                .tickSize(-innerwidth)
                .tickFormat("") ;

            var draw_line = d3.svg.line()
                .interpolate("basis")
                .x(function(d) { return x_scale(d[0]); })
                .y(function(d) { return y_scale(d[1]); }) ;

            var svg = d3.select(this)
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")") ;
            
            svg.append("g")
                .attr("class", "x grid")
                .attr("transform", "translate(0," + innerheight + ")")
                .call(x_grid) ;

            svg.append("g")
                .attr("class", "y grid")
                .call(y_grid) ;

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + innerheight + ")") 
                .call(x_axis)
                .append("text")
                .attr("dy", "-.71em")
                .attr("x", innerwidth)
                .style("text-anchor", "end")
                .text(xlabel) ;
            
            svg.append("g")
                .attr("class", "y axis")
                .call(y_axis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .style("text-anchor", "end")
                .text(ylabel) ;

            var data_lines = svg.selectAll(".multi_chart_line")
                .data(datasets.map(function(d) {return d3.zip(d.x, d.y);}))
                .enter().append("g")
                .attr("class", "multi_chart_line") ;
            
            data_lines.append("path")
                .attr("class", "line")
                .attr("d", function(d) {return draw_line(d); })
                .attr("stroke", function(d, i) {
                	//console.log(d, i, datasets[i]);
                	return getStrokeColor(datasets[i].name);
                })
                .style("stroke-dasharray", function(d, i){
                	return (getStrokeDash(datasets[i].name));
                });


		});
	}

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

    chart.maxAxis = function(value) {
    	if(!arguments.length) return ylabel ;
    	maxAxis = value ;
    	return chart ;
    } ;

    return chart;
}

function getStrokeColor(str) {
	//console.log(str);
	if (str.search("A:1.1") != -1) {
		return "#FF0000"
	}
	if (str.search("A:1.2") != -1) {
		return "#FF3D00"
	}
	if (str.search("A:1.3") != -1) {
		return "#FF7A00"
	}
	if (str.search("A:1.4") != -1) {
		return "#FFB700"
	}
	if (str.search("A:1.5") != -1) {
		return "#FFF400"
	}

	if (str.search("A:2.1") != -1) {
		return "#CBFF00"
	}
	if (str.search("A:2.2") != -1) {
		return "#8EFF00"
	}
	if (str.search("A:2.3") != -1) {
		return "#51FF00"
	}
	if (str.search("A:2.4") != -1) {
		return "#14FF00"
	}
	if (str.search("A:2.5") != -1) {
		return "#00FF28"
	}

	if (str.search("A:3.1") != -1) {
		return "#00FF65"
	}
	if (str.search("A:3.2") != -1) {
		return "#00FFA3"
	}
	if (str.search("A:3.3") != -1) {
		return "#00FFE0"
	}
	if (str.search("A:3.4") != -1) {
		return "#00E0FF"
	}
	if (str.search("A:3.5") != -1) {
		return "#00A3FF"
	}

	if (str.search("A:4.1") != -1) {
		return "#0065FF"
	}
	if (str.search("A:4.2") != -1) {
		return "#0028FF"
	}
	if (str.search("A:4.3") != -1) {
		return "#1400FF"
	}
	if (str.search("A:4.4") != -1) {
		return "#5100FF"
	}
	if (str.search("A:4.5") != -1) {
		return "#8E00FF"
	}

	if (str.search("A:5.1") != -1) {
		return "#CB00FF"
	}
	if (str.search("A:5.2") != -1) {
		return "#FF00F4"
	}
	if (str.search("A:5.3") != -1) {
		return "#FF00B7"
	}
	if (str.search("A:5.4") != -1) {
		return "#FF007A"
	}
	if (str.search("A:5.5") != -1) {
		return "#FF003D"
	}

	return "#ff0000";
}

function getStrokeDash(str) {
	if (str.search("C:1") != -1) {
		return "10, 5"
	}
	if (str.search("C:2") != -1) {
		return "5, 10"
	}
	if (str.search("C:3") != -1) {
		return "5, 1"
	}
	if (str.search("C:4") != -1) {
		return "0.9"
	}
	if (str.search("C:5") != -1) {
		return "5, 5, 1, 5"
	}

}