//sizeBy:
function none(d){
    return 1;
}
function t1(d){
    return Math.max(Math.sqrt(Math.sqrt(d.rate[idx1])), 1);
}
function t2(d){
    return Math.max(Math.sqrt(Math.sqrt(d.rate[idx2])), 1);
}
function aver(d) {
    var sum = 0;
    for (var i = 0; i < d.rate.length; i ++) {
        sum += d.rate[i];
    }
    sum /= d.rate.length;
    return Math.max(Math.sqrt(Math.sqrt(sum)), 1);
}
function tt12(d) {
    return Math.max(Math.sqrt(Math.sqrt(Math.abs(d.rate[idx1] - d.rate[idx2]))), 1);
}
function sizeControl(d) {
    //console.log(cancelList);
    var showEBool = document.getElementById("SExculded").checked;
    if (!showEBool) {
        for (key in excludeList) {
            if (excludeList[key].includes(d.id)) {
                return 0;
            }
        }
        if (cancelList.includes(d.id)) {
            return 0;
        }
    }
    var s = document.getElementById("sizeBy");
    var slct = s.options[s.selectedIndex].value;
    if (slct == "none") { return none(d);} 
    else if (slct == "t1") { return t1(d);} 
    else if (slct == "t2") { return t2(d);} 
    else if (slct == "aver") {return aver(d);}
    else if (slct == "tt12") {return tt12(d);}
}

//colorBy:

function colorControl(d) {
    if (excludeList.hasOwnProperty(d.id) || cancelList.includes(d.id)) {
        return cancelColor;
    }
    var choseColor;
    var s = document.getElementById("colorBy");
    var slct = s.options[s.selectedIndex].value;
    if (slct == "none") {
        choseColor = childColor;
    } else if (slct == "t1") {
        if (d.id.startsWith('c-')) {
            choseColor = color1c(Math.sqrt(Math.sqrt(d.rate[idx1])));
        } else if (d.id.startsWith('p-')) {
            choseColor = color1p(Math.sqrt(Math.sqrt(d.rate[idx1])));
        }
        
    } else if (slct == "t2") {
        if (d.id.startsWith('c-')) {
            choseColor = color1c(Math.sqrt(Math.sqrt(d.rate[idx2])));
        } else if (d.id.startsWith('p-')) {
            choseColor = color1p(Math.sqrt(Math.sqrt(d.rate[idx2])));
        }
    } else if (slct == "diff12") {
        if (d.rate[idx1] - d.rate[idx2] >= 0) {
            choseColor = color2(Math.sqrt(Math.sqrt(d.rate[idx1] - d.rate[idx2])));
        } else {
            choseColor = color2(-Math.sqrt(Math.sqrt(d.rate[idx2] - d.rate[idx1])));
        }
    } else if (slct == "diff21") {
        if (d.rate[idx2] - d.rate[idx1] >= 0) {
            choseColor = color2(Math.sqrt(Math.sqrt(d.rate[idx2] - d.rate[idx1])));
        } else {
            choseColor = color2(- Math.sqrt(Math.sqrt(d.rate[idx1] - d.rate[idx2])));
        }
    } else if (slct == "aver"){
        var sum = 0;
        for (var i = 0; i < d.rate.length; i ++) {
            sum += d.rate[i];
        }
        sum /= d.rate.length;
        if (d.id.startsWith('c-')) {
            choseColor = color1c(Math.sqrt(Math.sqrt(sum)));
        } else if (d.id.startsWith('p-')) {
            choseColor = color1p(Math.sqrt(Math.sqrt(sum)));
        }
    } else if (slct == "pdiff12") {
        //choseColor = color3((d.rate[idx1] - d.rate[idx2]) / Math.max(1, d.rate[idx2]));
        if (d.rate[idx1] - d.rate[idx2] > 0) {
            choseColor = color3(Math.min(2, ((d.rate[idx1] - d.rate[idx2]) / Math.max(1, d.rate[idx2]))));
        } else {
            choseColor = color3(Math.max(-2, ((d.rate[idx1] - d.rate[idx2]) / Math.max(1, d.rate[idx2]))));
        }
        
    } else if (slct == "pdiff21") {
        //choseColor = color3((d.rate[idx2] - d.rate[idx1]) / Math.max(1, d.rate[idx1]));
        if (d.rate[idx2] - d.rate[idx1] > 0) {
            choseColor = color3(Math.min(2, ((d.rate[idx2] - d.rate[idx1]) / Math.max(1, d.rate[idx1]))));
        } else {
            choseColor = color3(Math.max(-2, ((d.rate[idx2] - d.rate[idx1]) / Math.max(1, d.rate[idx1]))));
        }   
    }
    if (groupList.hasOwnProperty(d.id)) {
        return choseColor;
    }
    return d.children ? headerColor : choseColor;
}

//legend:
function legendControl() {
    var legend = d3.select("#legend");
    legend.selectAll("*").remove();
    var dataset;

    var s = document.getElementById("colorBy");
    var slct = s.options[s.selectedIndex].value;
    if (slct == "none") {
        dataset = [-100];
    } else if (slct == "t1" || slct == "t2" || slct == "aver") {
        dataset = ["Leave:", 0, 3, 6, 9, 12, 15, 18, "Parent:", 0, 4, 8, 12, 16, 20, 24, 28, 32];
    } else if (slct == "diff12" || slct == "diff21") {
        dataset = [-18, -12, -6, 0, 6, 12, 18];
    } else if (slct == "pdiff12" || slct == "pdiff21") {
        dataset = [-2, -1, -0.5, 0, 0.5, 1, 2];
    }

    var xLoc = [];
    for (var i = 0; i < dataset.length; i ++) {
        xLoc.push(i * 60);
    }

    legend = d3.select("#legend").append("svg")
      .attr("width", tm_chartWidth)
      .attr("height", 40)
      .attr('class', 'legend')
      .selectAll("g")
          .data(dataset)
          .enter()
          .append('g');

    legend.append("rect")
        .attr("x", function(d, i){
            return xLoc[i];
         })
        .attr("y", 0)
        .attr("fill", function(d, i) {
            if (slct == "none") {
                return childColor;
            } else if (slct == "t1" || slct == "t2" || slct == "aver") {
                if (i == 0 || i == 8) {
                    return "#ffffff";
                }
                if (i <= 7) {
                    return color1c(dataset[i]); 
                } else {
                    return color1p(dataset[i]);
                }
            } else if (slct == "diff12" || slct == "diff21") {
                return color2(d);
            } else if (slct == "pdiff12" || slct == "pdiff21") {
                return color3(d);
            }
        })
        .attr('width', '60px')
        .attr('height', '40px');

    legend.append("text")
            .text(function(d){
                if (slct == "none") {
                    return "N/A"
                } else if (slct == "t1" || slct == "t2" || slct == "aver") {
                    if (typeof(d) == "string") {
                        return d;
                    }
                    return abbreviateNumber(Math.pow(d, 4));
                } else if (slct == "diff12" || slct == "diff21") {
                    if (d < 0) {
                        return '-' + abbreviateNumber(Math.pow(d, 4)); 
                    }
                    return abbreviateNumber(Math.pow(d, 4));
                } else if (slct == "pdiff12" || slct == "pdiff21") {
                    if (Math.abs(d) == 2) {
                        return (d * 100).toString() + '%+';
                    }
                    return (d * 100).toString() + '%';
                }
            })
            .attr('y', 25)
            .attr('x', function(d, i){return xLoc[i] + 30; });
}


function getPath(node) {
    var startStr = node.name;
    while (typeof(node.parent) != "undefined") {
        node = node.parent;
        startStr = node.name + ';' + startStr;
    }
    return startStr;
}


function drawTree(tree) {
    console.log(tree);
    //Treemap Start:
    treemap = d3.layout.treemap()
        .round(false)
        .size([tm_chartWidth, tm_chartHeight])
        .sticky(true)
        .value(sizeControl);


    svg_treemap = d3.select("#treemap");
    svg_treemap.selectAll("*").remove();

    svg_treemap = d3.select("#treemap")
        .append("svg:svg")
        .attr("width", tm_chartWidth)
        .attr("height", tm_chartHeight);


    chart = svg_treemap.append("svg:g");

    //path:
    grandparent = d3.select("#path");
    grandparent.selectAll("*").remove();
    grandparent = d3.select("#path")
        .append("svg:svg")
        .attr("width", tm_chartWidth)
        .attr("height", gp_headerHeight);

    grandparent.append("rect")
        .attr("width", tm_chartWidth)
        .attr("height", gp_headerHeight)
        .style("fill", headerColor);

    grandparent.append("text")
               .attr("x", 6)
               .attr("y", 6)
               .attr("dy", ".75em")
               .attr("fill", "blue")
               .attr("text-decoration", "underline");

    //all rects

    node = root = tree;
    console.log(root);


    var nodes = treemap.nodes(root);
    //console.log(nodes);
    var children = nodes.filter(function(d) {
        return !d.children;
    });
    //console.log(children);

    var parents = nodes.filter(function(d) {
            return d.children;
        });

    // create parent cells
    var parentCells = chart.selectAll("g.cell.parent")
        .data(parents, function(d) {
            //return "p-" + d.id;
            return d.id;
        });

    slctedP();

    var parentEnterTransition = parentCells.enter()
        .append("g")
        .attr("class", "cell parent")
        .on("mouseover", function(d) {
            chart.selectAll(".cell.parent")[0].forEach(function(p){
                if (d3.select(p).select('rect')[0][0].classList[0] == d.id) {
                    d3.select(p).select('rect')
                      .style("stroke", mouseOverStroke)
                      .style("stroke-width", mouseOverStrokeWidth);
                }
            })
            lineHighlightP(d);
        })
        .on("mouseout", function(d) {
            chart.selectAll(".cell.parent")[0].forEach(function(p){
                if (d3.select(p).select('rect')[0][0].classList[0] == d.id) {
                    d3.select(p).select('rect')
                      .style("stroke", mouseOutStroke)
                      .style("stroke-width", mouseOutStrokeWidth);
                }
            })
            lineHighlightRemoveP(d);
            lockedHighlight();
        })
        //.on("contextmenu", d3.contextMenu(menuOptions))
        .call(ccp);

    parentEnterTransition.append("rect")
        .attr("class", function(d){ return d.id;})
        .attr("width", function(d) {
            return d.dx;
        })
        .attr("height", function(d) { return d.dy; })
        .style("fill", headerColor);

    parentEnterTransition.append('foreignObject')
        .attr("class", "foreignObject")
        .append("xhtml:body")
        .attr("class", "labelbody")
        .append("div")
        .attr("class", "label");

    // update transition
    var parentUpdateTransition = parentCells.transition().duration(transitionDuration);
    parentUpdateTransition.select(".cell")
        .attr("transform", function(d) {
            return "translate(" + d.dx + "," + d.y + ")";
        });
    parentUpdateTransition.select("rect")
        .attr("width", function(d) {
            //return Math.max(0.01, d.dx);
            return d.dx;
        })
        .attr("height", function(d) { return d.dy; })
        .style("fill", headerColor);
    parentUpdateTransition.select(".foreignObject")
        .attr("width", function(d) {
            //return Math.max(0.01, d.dx);
            return d.dx;
        })
        .attr("height", function(d) { return d.dy; })
        .select(".labelbody .label")
        .text(function(d) {
            return d.name;
        });

    // remove transition
    parentCells.exit()
        .remove();



    // create children cells
    var childrenCells = chart.selectAll("g.cell.child")
        .data(children, function(d) {
            //return "c-" + d.id;
            return d.id;
        });
    // enter transition
    var childEnterTransition = childrenCells.enter()
        .append("g")
        .attr("class", "cell child")
        .on("mouseover", function(d) {
            lineHighlight(d.id);
            this.parentNode.appendChild(this);
            d3.select(this)
              .select(".background")
              .style("stroke", mouseOverStroke)
              .style("stroke-width", mouseOverStrokeWidth);
            
        })
        .on("mouseout", function(d) {
            lineHighlightRemove(d.id);
            document.getElementById("mouseOverNodeInfo").innerHTML = '';
            d3.select(this)
              .select(".background")
              .style("stroke", mouseOutStroke)
              .style("stroke-width", mouseOutStrokeWidth);
            lockedHighlight();
        })
        //.on("contextmenu", function(d){
        //     cancelUncancel(d, 'm');
        // })
        .call(ccc);

    childEnterTransition.append("rect")
        .attr("class", function(d){ return d.id;})
        .classed("background", true)
        .style("fill", function(d) {
            return colorControl(d);
        })
        .append("title")
        .text(function(d){
            return d.name;
        });

    childEnterTransition.append('foreignObject')
        .attr("class", "foreignObject")
        .attr("width", function(d) {
            return d.dx;
        })
        .attr("height", function(d) {
            return d.dy;
        })
        .append("xhtml:body")
        .attr("class", "labelbody")
        .append("div")
        .attr("class", "label")
        .text(function(d) {
            return d.name;
        });

    // update transition
    var childUpdateTransition = childrenCells.transition().duration(transitionDuration);
    childUpdateTransition.select(".cell")
        .attr("transform", function(d) {
            return "translate(" + d.x  + "," + d.y + ")";
        });
    childUpdateTransition.select("rect")
        .attr("width", function(d) {
            return d.dx;
        })
        .attr("height", function(d) {
            return d.dy;
        })
        .style("fill", function(d) {
            return colorControl(d);
        });
    childUpdateTransition.select(".foreignObject")
        .attr("width", function(d) {
            return d.dx;
        })
        .attr("height", function(d) {
            return d.dy;
        })
        .select(".labelbody .label")
        .text(function(d) {
            return d.name;
        });
    // exit transition
    childrenCells.exit()
        .remove();
    
    zoom(node);
}

function zoom(d) {
    this.treemap
        .padding([headerHeight/(tm_chartHeight/d.dy), 4, 4, 4])
        .nodes(d);

    //
    grandparent.on("click", function(){
                  //console.log(d);
                  zoom(typeof(d.parent) === "undefined" ? root : d.parent);
                  updateTSChart();
                  //updateLineChart();
                })
               .select("text")
               .text(getPath(d, d.name));


    // moving the next two lines above treemap layout messes up padding of zoom result
    var kx = tm_chartWidth  / d.dx;
    var ky = tm_chartHeight / d.dy;
    var level = d;

    xscale.domain([d.x, d.x + d.dx]);
    yscale.domain([d.y, d.y + d.dy]);

    //var zoomTransition
    zoomTransition = chart.selectAll("g.cell").transition().duration(transitionDuration)
        .attr("transform", function(d) {
            return "translate(" + xscale(d.x) + "," + yscale(d.y) + ")";
        })
        .each("end", function(d, i) {
            if (!i && (level !== self.root)) {
                chart.selectAll(".cell.child")
                    .filter(function(d) {
                        return d.parent === self.node; // only get the children for selected group
                    })
                    .select(".foreignObject .labelbody .label")
                    .style("color", function(d) {
                        return "#000000";
                    });
            }
        });

    zoomTransition.select(".foreignObject")
        .attr("width", function(d) {
            return kx * d.dx;
        })
        .attr("height", function(d) {
            return ky * d.dy;
        })
        .select(".labelbody .label")
        .text(function(d) {
            if (document.getElementById("RHeader").checked) {
                if (d.id.startsWith("p-")) {
                    return "";
                }
            }
            if (!document.getElementById("SExculded").checked) {
                for (key in excludeList) {
                    if (d.id == key) {return "";}
                }
            }
            if (ky * d.dy < 33 || kx * d.dx < 33) {
                return "";
            }
            var len = d.name.split(";").length;
            return d.children ? d.name : d.name.split(";")[len - 1];
        });

    // update the width/height of the rects
    zoomTransition.select("rect")
        .attr("width", function(d) {
            return kx * d.dx;
        })
        .attr("height", function(d) {
            return ky * d.dy;
        })
        .style("fill", function(d) {
            return colorControl(d);
        });

    node = d;

    chart.selectAll("g.cell")
         .attr("display", function(d){
            for (var key in groupList) {
                if (groupList[key].includes(d.id)){
                    return "none";
                }
            }
            for (var key in excludeList) {
                if (excludeList[key].includes(d.id)){
                    return "none";
                }
            }
            
         });
    
    treemap.value(sizeControl);
    //lockedHighlight();

    //if (d3.event) {
    //    d3.event.stopPropagation();
    //}
}

function lineHighlight(lid) {
    var node = getNodeByIdCurT(lid)[0];

    document.getElementById("mouseOverNodeInfo").innerHTML = '(Node ID: ' + node.id + ') (Node Name: ' + node.name +') (Level: ' + (node.depth + 1) + 
               ') (Day Rate: [-2: ' + node.rate[0] + '], [0: ' + node.rate[1] + '], [1: ' + node.rate[2] + '], [7: ' + node.rate[3] + '], [28: ' + node.rate[4] +'])<br>'
               + '(Node Path: ' + getPath(node, node.name) + ')';

    svg_timeseries.selectAll(".d3_xy_chart_line").select('path')[0].forEach(function(p){
        if (p.classList[0] == lid + '_line') {
            d3.select(p).style("stroke-width", "5px");
        } else {
            d3.select(p).style('opacity', 0.1);
        }
    })
    svg_timeseries.selectAll(".d3_xy_chart_line").select('text')[0].forEach(function(t){
        if (t.classList[0] == lid + '_text') {
            d3.select(t).style("stroke-width", "5px");
            d3.select(t).style("display", "block");
        } else {
            d3.select(t).style('opacity', 0);
        }
    })
}

function lineHighlightRemove(lid) {
    console.log("Line Highlight Remove");
    svg_timeseries.selectAll(".d3_xy_chart_line").select('path')[0].forEach(function(p){
        if (p.classList[0] == lid + '_line') {
            d3.select(p).style("stroke-width", "2.5px");
        } else {
            d3.select(p).style('opacity', 1);
        }
    })
    svg_timeseries.selectAll(".d3_xy_chart_line").select('text')[0].forEach(function(t){
        if (t.classList[0] == lid + '_text') {
            d3.select(t).style("stroke-width", "2.5px");
            d3.select(t).style("display", "none");
        } else {
            d3.select(t).style('opacity', 1);
        }
    })
    previewTreeLine(resHighLight);
}

function lineHighlightP(pn) {
    var pn_children = getAllChildren(pn);
    svg_timeseries.selectAll(".d3_xy_chart_line").select('path')[0].forEach(function(p){
        if (pn_children.includes(p.classList[0].slice(0, -5)) || pn.id == p.classList[0].slice(0, -5)) {
            d3.select(p).style("stroke-width", "5px");
        } else {
            d3.select(p).style('opacity', 0.1);
        }
    })
    svg_timeseries.selectAll(".d3_xy_chart_line").select('text')[0].forEach(function(t){
        if (pn_children.includes(t.classList[0].slice(0, -5)) || pn.id == t.classList[0].slice(0, -5)) {
            d3.select(t).style("stroke-width", "5px");
            if (pn.id == t.classList[0].slice(0, -5)) {
                d3.select(t).style("display", "block");
            }
        } else {
            d3.select(t).style('opacity', 0);
        }
    })
    document.getElementById("mouseOverNodeInfo").innerHTML = '(Node ID: ' + pn.id + ') (Node Name: ' + pn.name +') (Level: ' + (pn.depth + 1) +') (Numbers of Children (leaves): ' + getAllChildrenCount(pn) + ')<br>' 
               + '(Node Path: ' + getPath(pn, pn.name) + ')';
}

function lineHighlightRemoveP(pn) {
    var pn_children = getAllChildren(pn);
    svg_timeseries.selectAll(".d3_xy_chart_line").select('path')[0].forEach(function(p){
        if (pn_children.includes(p.classList[0].slice(0, -5)) || pn.id == p.classList[0].slice(0, -5)) {
            d3.select(p).style("stroke-width", "2.5px");
        } else {
            d3.select(p).style('opacity', 1);
        }
    })
    svg_timeseries.selectAll(".d3_xy_chart_line").select('text')[0].forEach(function(t){
        if (pn_children.includes(t.classList[0].slice(0, -5)) || pn.id == t.classList[0].slice(0, -5)) {
            d3.select(t).style("stroke-width", "2.5px");
            if (pn.id == t.classList[0].slice(0, -5)) {
                d3.select(t).style("display", "none");
            }
        } else {
            d3.select(t).style('opacity', 1);
        }
    })
    document.getElementById("mouseOverNodeInfo").innerHTML = '';
    previewTreeLine(resHighLight);
}

function lockedHighlight() {
    chart.selectAll(".cell.child")[0].forEach(function(g){
        if (d3.select(g).select('.background')[0][0].classList[0] == selectedC.id) {
            //console.log(d3.select(g).select('.background'));
            d3.select(g).select('.background')
              .style("stroke", clickStroke)
              .style("stroke-width", 4);
        }
    })

    var selectedPId;
    if (isEmpty(selectedP)) {
        selectedPId = "p-1";
    } else {
        selectedPId = selectedP.id;
    }

    chart.selectAll(".cell.parent")[0].forEach(function(p){
        if (d3.select(p).select('rect')[0][0].classList[0] == selectedPId) {
            d3.select(p).select('rect')
              .style("stroke", clickStroke)
              .style("stroke-width", 4);
        } 
    })

    svg_timeseries.selectAll(".d3_xy_chart_line").select('path')[0].forEach(function(p){
        if (p.classList[0] == selectedC.id + '_line' || p.classList[0] == selectedPId + '_line') {
            d3.select(p).style("stroke-width", "5px");
        } 
    })

    svg_timeseries.selectAll(".d3_xy_chart_line").select('text')[0].forEach(function(t){
        if (t.classList[0] == selectedC.id + '_text' || t.classList[0] == selectedPId + '_text') {
            d3.select(t).style("display", "block");
        }
    })
}


function drawLineChart(lineData) {
    xy_chart = d3_xy_chart()
                .xlabel("Day")
                .ylabel("Amount of Bacteria");

    color_scale = d3.scale.category10()
                .domain(d3.range(lineData.length));

    svg_timeseries = d3.select(".timeseries");
    svg_timeseries.selectAll("*").remove();
    
    //heatmap(lineData);
    svg_timeseries.datum(lineData)
            .call(xy_chart);
}

function updateTSChart() {
    d3.select("#TSheader").text("");
    //d3.select("#redLine").selectAll("*").remove();

    svg_timeseries = d3.select(".timeseries");
    svg_timeseries.selectAll("*").remove();

    //get data: (from updatelinechart)
    var childList = getAllChildren(node);
    childList.push(node.id);

    var lineData = [];

    var nodes = treemap.nodes(root);
    var children = nodes.filter(function(d) {
        return !d.children;
    });
    var parents = nodes.filter(function(d) {
        return d.children;
    });

    var ec = [];

    console.log(cancelList, groupList, excludeList);

    for (var key in groupList) {
        for (var i = 0; i < groupList[key].length; i ++) {
            if (!ec.includes(groupList[key][i])) {
                ec.push(groupList[key][i]);
            }
        }
    }

    parents.forEach(function(p) {
        if (groupList.hasOwnProperty(p.id) && childList.includes(p.id)) {
            var tmpLine = {"x": [-2, 0, 1, 7, 28], "y": p.rate, "id": p.id, "name": p.name};
            lineData.push(tmpLine);
        }
    })

    children.forEach(function(c) {
        if (childList.includes(c.id) && !ec.includes(c.id)) {
            var tmpLine = {"x": [-2, 0, 1, 7, 28], "y": c.rate, "id": c.id, "name": c.name};
            lineData.push(tmpLine);
        }
    })

    console.log(lineData);

    curTime = lineData.filter(function(d) {
        var exclude = false;
        if (cancelList.includes(d.id)) {
            exclude = true;
        }

        for (var key in excludeList) {
            if (key == d.id){
                exclude = true;
                break;
            }
            if (excludeList[key].includes(d.id)) {
                exclude = true;
                break;
            }
        }
        if (!exclude) {
            return d;
        }
    })

    console.log(curTime);
    //end

    var s = document.getElementById("timeChart");
    var slct = s.options[s.selectedIndex].value;
    console.log(slct);
    if (slct == "linechart") {
        drawLineChart(lineData);
    } else if (slct == "heatmap") {
        heatmap(curTime);
    } else if (slct == "stackedbar") {
        if (curTime.length > 20) {
            alert("Too much current leave node for Stacked Bar Chart");
        } else {
            stackedbarchart(curTime);
        }
    } else if (slct == "mullinechart") {
    	if (curTime.length > 100) {
    		//alert("Too much charts to draw, it will take some time.");
    		if (confirm("Too much charts to draw, it will take some time.")) {
    			drawMulLinechart();
    		} else {
    			return ;
    		}
    	} else {
    		drawMulLinechart();
    	}
        
    }

    updateBarChart(curTime);
    previewTreeLine([]);
}