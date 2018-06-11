///Global Variable///////////////
///Treemap:
var supportsForeignObject,
    tm_chartWidth, 
    tm_chartHeight, 
    xscale,
    yscale,
    headerHeight,
    gp_headerHeight,
    headerColor,
    childColor,
    cancelColor,
    transitionDuration,
    root,
    node,
    treemap,
    svg_treemap,
    chart,
    zoomTransition,
    grandparent;


//treemap stroke:
var clickStroke = "#236477";
var mouseOverStroke = "#4a6c2f";
var mouseOutStroke = "#EEEEEE";

var mouseOverStrokeWidth = "2.5px";
var mouseOutStrokeWidth = "1px";

var mouseOverLineWidth = "7px";
var mouseOutLineWidth = "2.5px";

// color 1 for absolute value:
var colorDomain1c = [0, 8, 18];
var colorRange1c = ['#FFE0B2', '#FF9800', '#E65100'];
var color1c = d3.scale.linear().domain(colorDomain1c).range(colorRange1c);

var colorDomain1p = [0, 16, 32];
var colorRange1p = ['#FFCCBC', '#FF5722', '#BF360C'];
var color1p = d3.scale.linear().domain(colorDomain1p).range(colorRange1p);
// color 2 for absolute diff:
var colorDomain2 = [-18, -1, 1, 18];
var colorRange2 = ['#B71C1C', '#FFCDD2', '#C8E6C9', '#1B5E20'];
var color2 = d3.scale.linear().domain(colorDomain2).range(colorRange2);
//color 3 for percentage diff:
var colorDomain3 = [-2, -0.3, 0.3, 2];
var colorRange3 = ['#B71C1C', '#FFCDD2', '#C8E6C9', '#1B5E20'];
var color3 = d3.scale.linear().domain(colorDomain3).range(colorRange3);

//line chart:
var xy_chart, svg_timeseries, color_scale;

var svg_dischart;
var idx1 = 0, idx2 = 0;
var line1X = 0, 
    line2X = 0;
//line chart end


var groupList = {};
var excludeList = {};
var cancelList = [];

var selectedP = {};
var selectedC = {};

var slctPLevel = {};
var slctPRel = {};

//log:
//operations:
//type1: group, ungroup, exclude, include, cancel, uncancel
//name, id
//type2: filter, agg
//name, scale, range
//type3: absolute agg:
//id, level
//type4: relative agg:
//id, +/- (true/flase)

var operationStack = [];
var dataStack = [];

var treeData, curTree, timeData, curTime;

var realTree;

function initVis() {
    $.get("/getLine", function(data) {
        timeData = JSON.parse(data);
        console.log(timeData);
        $.get("/getTree", function(data) {
            treeData = $.parseJSON(data);
            console.log(treeData);
            treeGetRate();
            console.log(curTree);
            setControl();
            drawTree(curTree);
            realTree = buildTree();
            showTitle();
            legendControl();
            updateTSChart();
            //updateLineChart();
            lockedHighlight();
        });
    });
}

initVis();

function treeGetRate() {
    curTree = treeData;

    var goThr = [curTree];
    var curNode;


    while (goThr.length > 0) {
        curNode = goThr[0];
        if (curNode.id.startsWith("p-")) {
            var tmpChild = getAllChildren(curNode);
            var tmpRate = [0, 0, 0, 0, 0];
            tmpChild.forEach(function(child) {
                for (var i = 0; i < tmpRate.length; i ++) {
                    if (child.startsWith("c-")) {
                        tmpRate[i] += timeData[child]["total"][i];
                    }
                }
            })
            curNode["rate"] = tmpRate;
        } else {
            curNode["rate"] = timeData[curNode.id]["total"];
        }

        if (typeof(curNode.children) != "undefined") {
            curNode.children.forEach(function(child) {
                goThr.push(child);
            })
        }

        goThr.splice(0, 1);
    }

    console.log(treeData, curTree);
}


function setControl() {
    //Define Variable:
    supportsForeignObject = Modernizr.svgforeignobject;
    tm_chartWidth = 1250;
    tm_chartHeight = 1050;
    xscale = d3.scale.linear().range([0, tm_chartWidth]);
    yscale = d3.scale.linear().range([0, tm_chartHeight]);
    headerHeight = 20;
    gp_headerHeight = 20;
    headerColor = "#A1887F";
    childColor = "#FFAB91";
    cancelColor = "#E0E0E0";
    transitionDuration = 500;


    ////////////////Control//////////////////
    d3.select("#sizeBy").on("change", function() {
        treemap.value(sizeControl);
        zoom(node);
        showTitle();
    });

    d3.select("#colorBy").on("change", function() {
        zoom(node);
        legendControl();
        showTitle();
    });

    d3.select("#treeAgg").on("change", function() {
        //unfinish
        var s = document.getElementById("treeAgg");
        var slct = s.options[s.selectedIndex].value;
        absAgg(slct);
        zoom(node);
        updateTSChart();
        //updateLineChart();
    });


    var checkRemoveHButton = document.querySelector("input[name=RHeader]");
    checkRemoveHButton.addEventListener('change', function(){
        if (this.checked) {
            headerHeight = 7;
        } else {
            headerHeight = 20;
        }
        zoom(node);
    });

    d3.select("#timeChart").on("change", function(){
        updateTSChart();
        showTitle();
    });

    var checkShowEButton = document.querySelector("input[name=SExculded]");
    checkShowEButton.addEventListener('change', function(){
        treemap.value(sizeControl);
        zoom(node);
        updateTSChart();
        //updateLineChart();
    });


    ////////////////Control End//////////////////
}


function showTitle() {
    //treemap: size, color, data source
    var s = document.getElementById("sizeBy");
    var size = s.options[s.selectedIndex].value;
    var sizeStr = ""
    if (size == "none") {
        sizeStr = "None;";
    } else if (size == "t1") {
        sizeStr = "T1 Value;";
    } else if (size =="t2") {
        sizeStr = "T2 Value;";
    } else if (size == "aver") {
        sizeStr = "Average over Time;";
    } else if (size == "tt12") {
        sizeStr = "Absolute Diff between T1 and T2 (|T1 - T2|);";
    }

    var c = document.getElementById("colorBy");
    var color = c.options[c.selectedIndex].value;
    var colorStr = "";
    if (color == "none") {
        colorStr = "None;"
    } else if (color == "t1") {
        colorStr = "T1 Value;";
    } else if (color =="t2") {
        colorStr = "T2 Value;";
    } else if (color == "aver") {
        colorStr = "Average over Time;";
    } else if (color == "diff12") {
        colorStr = "T1 Value - T2 Value;";
    } else if (color == "diff21") {
        colorStr = "T2 Value - T1 Value;";
    } else if (color == "pdiff12") {
        colorStr = "Relative Change (T1 - T2) / T2;";
    } else if (color == "pdiff21") {
        colorStr = "Relative Change (T2 - T1) / T1;";
    } 


    d3.select('#treemapTitle').text("Treemap: Showing the tree structure of microbiome data; Size by: " + sizeStr + " Color By: " 
        + colorStr );

    var t = document.getElementById("timeChart");
    var timeC = t.options[t.selectedIndex].value;

    if (timeC == "linechart") {
        d3.select("#timeTitle").text("LineChart: Showing amount of bacteria over time; X Axis: Date, Y Axis: Amount of Bacteria (Drashed red lines represent valid dates for dragging)");
    } else if (timeC == "heatmap") {
        d3.select("#timeTitle").text("Heatmap: Showing amount of bacteria over time; X Axis: Date, Y Axis: Bacteria ID");
    } else if (timeC == "stackedbar") {
        d3.select("#timeTitle").text("LineChart: Showing amount of bacteria over time; X Axis: Date, Y Axis: Amount of Bacteria (Drashed red lines represent valid dates for dragging)");
    } else if (timeC == "mullinechart") {
        d3.select("#timeTitle").text("Multi LineChart: Showing amount of bacteria over time, split by Treaments and Animals; X Axis: Date, Y Axis: Amount of Bacteria");
    }

    var b = document.getElementById("brChart");
    var bar = b.options[b.selectedIndex].value;
    var barStr = ""
    if (bar == "t1v") {
        barStr = "T1 Value";
    } else if (bar == "t2v") {
        barStr = "T2 Value";
    } else if (bar =="t1t2") {
        barStr = "T1 Value - T2 Value";
    } else if (bar == "t2t1") {
        barStr = "T2 Value - T1 Value";
    } else if (bar == "tt12") {
        barStr = "Absolute Diff between T1 and T2 (|T1 - T2|)"
    }

    d3.select("#barchartTitle").text("BarChart: Showing the distribution of bacteria base on " + barStr + '(X Axis), Y Axis: Count of Bacteria');
}


function getAllChildren(node) {
    var tmp = [];
    var goThr = [node];
    var curNode;

    while (goThr.length > 0) {
        curNode = goThr[0];
        if (typeof(curNode.children) != "undefined") {
            curNode.children.forEach(function(child) {
                tmp.push(child.id);
                if (typeof(child.children) != "undefined") {
                    goThr.push(child);
                }
            });
        }
        goThr.splice(0, 1);
    }

    return tmp;
}



function getAllChildrenCount(d) { //for showing mouse over node info
    return getAllChildren(d).length;
}

function openControl() {
    var x = document.getElementById("controlPanel");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function openLog() {
    var x = document.getElementById("operationLog");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}


function buildTree() {
    var goThr = [treeData];
    var goThrNode;

    var tmpTree = {'name': 'ROOT', "children": [], "id": 'p-1', "level": 0};
    var tmpThr = [tmpTree]; 
    var tmpNode;

    while (goThr.length > 0) {
        goThrNode = goThr[0];
        tmpNode = tmpThr[0];

        if (typeof(goThrNode.children) != "undefined") {
            goThrNode.children.forEach(function(child) {
                if (!excludeList.hasOwnProperty(child.id) && !cancelList.includes(child.id)) {
                    var tmpc = {"name": child.name, "id": child.id, "level": tmpNode.level + 1, "parent": tmpNode};
                    if (child.id.startsWith("p-")) {
                        if (!groupList.hasOwnProperty(child.id)) {
                            goThr.push(child);
                            tmpc["children"] = [];
                            tmpThr.push(tmpc);
                        }
                        
                    }

                    tmpNode.children.push(tmpc);
                }
            })
        }

        goThr.splice(0, 1);
        tmpThr.splice(0, 1);
    }

    console.log(treeData, tmpTree);

    return tmpTree;
}


function clearAllLog() {
    operationStack = [];
    groupList = {};
    excludeList = {};
    cancelList = [];
    selectedP = {};
    selectedC = {};
    zoom(root);
    realTree = buildTree();
    lockedHighlight();
    displayOperations();
    updateTSChart();
    //updateLineChart();
}


function groupUngroup() {
    if (isEmpty(selectedP)) {
        alert("Plese select a node first, then do the group/ungroup operation.");
        return ;
    }
    if (excludeList.hasOwnProperty(selectedP.id)) {
        alert("Please include the node first, then do the group/ungroup operation.");
        return ;
    }
    if (!groupList.hasOwnProperty(selectedP.id)) {
        var cList = getAllChildren(selectedP);
        groupList[selectedP.id] = cList;
        addOperation(1, ['Group', selectedP]);
    } else {
        delete groupList[selectedP.id];
        addOperation(1, ['Ungroup', selectedP]);
    }

    zoom(node);
    slctedP();
    updateTSChart();
    //updateLineChart();
    lockedHighlight();
}

function includeExclude() {
    if (isEmpty(selectedP)) {
        alert("Plese select a node first, then do the include/exclude operation.");
        return ;
    }
    if (!excludeList.hasOwnProperty(selectedP.id)) {
        //if (groupList.hasOwnProperty(selectedP.id)) {
        //    delete groupList[selectedP.id];
        //}
        var cList = getAllChildren(selectedP);
        excludeList[selectedP.id] = cList;
        addOperation(1, ['Exclude', selectedP]);
    } else {
        delete excludeList[selectedP.id];
        addOperation(1, ['Include', selectedP]);
    }

    zoom(node);
    updateTSChart();
    //updateLineChart();
    lockedHighlight();
}

function cancelUncancel() {
    if (isEmpty(selectedC)) {
        alert("Please select a leave node first, then do the cancel/uncancel operation.");
        return ;
    }

    if (cancelList.includes(selectedC.id)){
        var idx = cancelList.indexOf(selectedC.id);
        cancelList.splice(idx, 0);
        addOperation(1, ['Uncancel', selectedC]);
    } else {
        cancelList.push(selectedC.id);
        addOperation(1, ['Cancel', selectedC]);
    }

    zoom(node);
    updateTSChart();
    //updateLineChart();
    lockedHighlight();
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

var SI_PREFIXES = ["", "k", "M", "G", "T", "P", "E"];

function abbreviateNumber(number){

    // what tier? (determines SI prefix)
    var tier = Math.log10(number) / 3 | 0;

    // if zero, we don't need a prefix
    if(tier == 0) return number;

    // get prefix and determine scale
    var prefix = SI_PREFIXES[tier];
    var scale = Math.pow(10, tier * 3);

    // scale the number
    var scaled = number / scale;

    // format number and add prefix as suffix
    //return scaled.toFixed(1) + prefix;
    return scaled.toFixed(0) + prefix;
}

function addOperation(type, attrs) {
    operationStack.push({'type': type, 'attrs': attrs});
    displayOperations();
}

function removeOperation() {
    //unfinished;
    displayOperations();
}

function displayOperations() {
    //log:
    //operations:
    //type1: group, ungroup, exclude, include, cancel, uncancel
    //name, id
    //type2: filter, agg
    //name, scale, range
    //type3: absolute agg:
    //id, level
    //type4: relative agg:
    //id, +/- (true/flase)

    var ul = document.getElementById("operationsList");
    d3.select(ul).text("");
    console.log(operationStack);
    for (var i = operationStack.length - 1; i >= 0; i --) {
        if (operationStack[i].type == 1) {
            var tmpStr = (i + 1).toString() + '. ' + operationStack[i].attrs[0] + ' Node ';
            var tmpNode = operationStack[i].attrs[1];
            if (tmpNode.id.startsWith("p-")) {
                tmpStr += tmpNode.name + ' (Path: ' +  getPath(tmpNode) + ')';
            } else {
                tmpStr += tmpNode.id + ' (Path: ' +  getPath(tmpNode) + ')';
            }
        } else if (operationStack[i].type == 2) {
            var tmpStr = (i + 1).toString() + '. ';
            var name = operationStack[i].attrs[0];
            var scale = operationStack[i].attrs[1];
            var range0 = operationStack[i].attrs[2].toString();
            var range1 = operationStack[i].attrs[3].toString();

            tmpStr += "Operation: " + name + " bases on: " + scale + "; Range: (" + range0 + ", " + range1 + ")";

        } else if (operationStack[i].type == 3) {
            var tmpStr = (i + 1).toString() + '. Absolute Agg on Node ';
            var tmpNode = operationStack[i].attrs[0];
            if (tmpNode.id.startsWith("p-")) {
                tmpStr += tmpNode.name + ' (Path: ' +  getPath(tmpNode) + ')';
            } else {
                tmpStr += tmpNode.id + ' (Path: ' +  getPath(tmpNode) + ')';
            }
            tmpStr += " ; Max Level Chosen: " + operationStack[i].attrs[1];

        } else if (operationStack[i].type == 4) {
            var tmpStr = (i + 1).toString() + '. Relative Agg on Node ';
            var tmpNode = operationStack[i].attrs[0];

            if (tmpNode.id.startsWith("p-")) {
                tmpStr += tmpNode.name + ' (Path: ' +  getPath(tmpNode) + ')';
            } else {
                tmpStr += tmpNode.id + ' (Path: ' +  getPath(tmpNode) + ')';
            }

            tmpStr += "; Level ";
            if (operationStack[i].attrs[1]) {
                tmpStr += "+ 1";
            } else {
                tmpStr += "- 1";
            }
        }
        $("#operationsList").append("<p>" + tmpStr + "</p>");
    }
}


//distinguish click and dblclick:
function clickcancel() {
  var event = d3.dispatch('click', 'dblclick');
  function cc(selection) {
      var down, tolerance = 5, last, wait = null, args;
      // euclidean distance
      function dist(a, b) {
          return Math.sqrt(Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2));
      }
      selection.on('mousedown', function() {
          down = d3.mouse(document.body);
          last = +new Date();
          args = arguments;
      });
      selection.on('mouseup', function() {
          if (dist(down, d3.mouse(document.body)) > tolerance) {
              return;
          } else {
              if (wait) {
                  window.clearTimeout(wait);
                  wait = null;
                  event.dblclick.apply(this, args);
              } else {
                  wait = window.setTimeout((function() {
                      return function() {
                          event.click.apply(this, args);
                          wait = null;
                      };
                  })(), 300);
              }
          }
      });
  };
  return d3.rebind(cc, event, 'on');
}

var ccc = clickcancel();
var ccp = clickcancel();

ccp.on("dblclick", function(d, index) {
    if (groupList.hasOwnProperty(d.id)) {
        zoom(root);
    } else {
        zoom(d);
    }
    updateTSChart();
    //updateLineChart();
});
ccp.on("click", function(d, index){
    clickP(d);
});

function clickP(d) {
    if (isEmpty(selectedP)) {
        selectedP = d;
        document.getElementById("slctPText").innerHTML = 'Selected Parent Node: (' + d.id + ')';
        document.getElementById("treeAggText").innerHTML = 'Tree Aggregatation (' + d.id + ')';
    } else if (selectedP.id == d.id) {
        chart.selectAll(".cell.parent")[0].forEach(function(p){
            if (d3.select(p).select('rect')[0][0].classList[0] == d.id) {
                d3.select(p).select('rect')
                  .style("stroke", mouseOutStroke)
                  .style("stroke-width", mouseOutStrokeWidth);
            }
        })
        svg_timeseries.selectAll(".d3_xy_chart_line").select('path')[0].forEach(function(p){
        if (p.classList[0] == d.id + '_line') {
                d3.select(p).style("stroke-width", mouseOutLineWidth);
            } 
        })
    
        svg_timeseries.selectAll(".d3_xy_chart_line").select('text')[0].forEach(function(t){
            if (t.classList[0] == d.id + '_text') {
                d3.select(t).style("display", "none");
            }
        })
        selectedP = {};
        document.getElementById("slctPText").innerHTML = 'Selected Parent Node: (None)';
        document.getElementById("treeAggText").innerHTML = 'Tree Aggregatation (Global)';
    } else {
        chart.selectAll(".cell.parent")[0].forEach(function(p){
            if (d3.select(p).select('rect')[0][0].classList[0] == selectedP.id) {
                d3.select(p).select('rect')
                  .style("stroke", mouseOutStroke)
                  .style("stroke-width", mouseOutStrokeWidth);
            }
        })
        svg_timeseries.selectAll(".d3_xy_chart_line").select('path')[0].forEach(function(p){
        if (p.classList[0] == selectedP.id + '_line') {
                d3.select(p).style("stroke-width", mouseOutLineWidth);
            } 
        })
    
        svg_timeseries.selectAll(".d3_xy_chart_line").select('text')[0].forEach(function(t){
            if (t.classList[0] == selectedP.id + '_text') {
                d3.select(t).style("display", "none");
            }
        })
        selectedP = d;
        document.getElementById("slctPText").innerHTML = 'Selected Parent Node: (' + d.id + ')';
        document.getElementById("treeAggText").innerHTML = 'Tree Aggregatation (' + d.id + ')';
    }

    lockedHighlight();
    slctedP();
}

function clickC(d) {
    if (isEmpty(selectedC)) {
        selectedC = d;
        document.getElementById("slctCText").innerHTML = 'Selected Leave Node: (' + d.id + ')';
    } else if (selectedC.id != d.id) {
        chart.selectAll(".cell.child")[0].forEach(function(c){
            if (d3.select(c).select('.background')[0][0].classList[0] == selectedC.id) {
                d3.select(c).select('.background')
                  .style("stroke", mouseOutStroke)
                  .style("stroke-width", mouseOutStrokeWidth);
            } 
        })
        svg_timeseries.selectAll(".d3_xy_chart_line").select('path')[0].forEach(function(p){
        if (p.classList[0] == selectedC.id + '_line') {
                d3.select(p).style("stroke-width", mouseOutLineWidth);
            } 
        })
    
        svg_timeseries.selectAll(".d3_xy_chart_line").select('text')[0].forEach(function(t){
            if (t.classList[0] == selectedC.id + '_text') {
                d3.select(t).style("display", "none");
            }
        })
        selectedC = d;
        document.getElementById("slctCText").innerHTML = 'Selected Leave Node: (' + d.id + ')';
    } else {
        chart.selectAll(".cell.child")[0].forEach(function(c) {
            if (d3.select(c).select('.background')[0][0].classList[0] == d.id) {
                d3.select(c).select('.background')
                  .style("stroke", mouseOutStroke)
                  .style("stroke-width", mouseOutStrokeWidth);
            } 
        })
        svg_timeseries.selectAll(".d3_xy_chart_line").select('path')[0].forEach(function(p){
        if (p.classList[0] == selectedC.id + '_line') {
                d3.select(p).style("stroke-width", mouseOutLineWidth);
            } 
        })
    
        svg_timeseries.selectAll(".d3_xy_chart_line").select('text')[0].forEach(function(t){
            if (t.classList[0] == selectedC.id + '_text') {
                d3.select(t).style("display", "none");
            }
        })
        selectedC = {};
        document.getElementById("slctCText").innerHTML = 'Selected Leave Node: (None)';
    }
    lockedHighlight();
}

ccc.on("dblclick", function(d, index) {
    zoom(node === d.parent ? root : d.parent);
    updateTSChart();
    //updateLineChart();
})
ccc.on("click", function(d, index) {
    //unfinish
    clickC(d);
})


function slctedP() {

    realTree = buildTree();

    slctPLevel = {};

    if (excludeList.hasOwnProperty(selectedP.id)) {
        return ;
    }

    var goThr = [root];

    if (!isEmpty(selectedP)) {
        goThr = [selectedP];
    }

    var rootLevel = goThr[0].depth;

    while (goThr.length > 0) {
        var curNode = goThr[0];
        var curLevel = curNode.depth - rootLevel + 1;

        if (!slctPLevel.hasOwnProperty(curLevel)) {
            slctPLevel[curLevel] = [curNode];
        } else {
            slctPLevel[curLevel].push(curNode);
        }

        if (typeof(curNode.children) != "undefined") {
            curNode.children.forEach(function(c) {
                goThr.push(c);
            })
        }

        goThr.splice(0, 1);

    }

    var forMaxLevel = {};

    if (!isEmpty(selectedP)) {
        goThr = [getNodeByIdRealT(selectedP.id)];
    } else {
        goThr = [getNodeByIdRealT("p-1")];
    }

    while (goThr.length > 0) {
        var curNode = goThr[0];
        var curLevel = curNode.level - rootLevel + 1;
        if (!forMaxLevel.hasOwnProperty(curLevel)) {
            forMaxLevel[curLevel] = [curNode]
        } else {
            forMaxLevel[curLevel].push(curNode);
        }
        if (typeof(curNode.children) != "undefined") {
            curNode.children.forEach(function(c) {
                goThr.push(c);
            })
        }
        goThr.splice(0, 1);
    }

    console.log(slctPLevel, forMaxLevel);
    addAbsAggOption(Object.keys(forMaxLevel).length);
}


function getNodeByIdRealT(id) {
    if (id == "p-1") {
        return realTree;
    }

    var goThr = [realTree];
    var curNode;

    while (goThr.length > 0) {
        curNode = goThr[0];
        if (typeof(curNode.children) != "undefined") {
            for (var i = 0; i < curNode.children.length; i ++) {
                if (curNode.children[i].id == id) {
                    return curNode.children[i];
                }
                if (typeof(curNode.children[i].children) != "undefined") {
                    goThr.push(curNode.children[i]);
                }
            }
        }
        goThr.splice(0, 1);
    }
}

function getNodeByIdCurT(id) {
    if (id == "p-1") {
        return root;
    }

    var nodes = treemap.nodes(root);
    var children = nodes.filter(function(d) {
        return !d.children;
    });
    var parents = nodes.filter(function(d) {
        return d.children;
    });

    if (id.startsWith("p-")) {
        return parents.filter(function(d) {
            return d.id == id;
        })
    } else {
        return children.filter(function(d) {
            return d.id == id;
        })
    }

}

function addAbsAggOption(slcted) {
    removeAllAggOptions();
    var max = Object.keys(slctPLevel).length;
    var slct = document.getElementById("treeAgg");
    for (var i = 1; i <= max; i ++) {
        if (slcted == i) {
            slct.options[slct.options.length] = new Option(i, i, false, true);
            continue;
        }
        slct.options[slct.options.length] = new Option(i, i, false, false);
    }
}

function removeAllAggOptions() {
    var select = document.getElementById("treeAgg");
    select.options.length = 0;
}

function absAgg(l) {
    if (excludeList.hasOwnProperty(selectedP.id)) {
        alert("Please include the node first, then do the aggregation operation.");
    } else {
        for (var i = 1; i < l; i ++) {
            for (var j = 0; j < slctPLevel[i].length; j ++) {
                delete groupList[slctPLevel[i][j].id];
            }
        }
        for (var i = 0; i < slctPLevel[l].length; i ++) {
            if (!groupList.hasOwnProperty(slctPLevel[l][i].id) && slctPLevel[l][i].id.startsWith("p-")) {
                var cList = getAllChildren(slctPLevel[l][i]);
                groupList[slctPLevel[l][i].id] = cList;
            }
        }
        for (var key in slctPLevel) {
            if (key > l) {
                for (var i = 0; i < slctPLevel[key].length; i ++) {
                    delete groupList[slctPLevel[key][i].id];
                }
            }
        }
        if (isEmpty(selectedP)) {
            addOperation(3, [getNodeByIdCurT("p-1"), l]);
        } else {
            addOperation(3, [selectedP, l]);
        }
        
    }

    zoom(node);
    //curTree = buildTree();
    updateTSChart();
    //updateLineChart();
    lockedHighlight();
    slctedP();
}

function getRLevel() {
    //relative agg:
    //1: will be grouped (list of id)
    //0: will be ungrouped (list of id)

    realTree = buildTree();
    console.log(realTree);

    slctPRel[0] = [];
    slctPRel[1] = [];

    var goThr;

    if (!isEmpty(selectedP)) {
        goThr = [getNodeByIdRealT(selectedP.id)];
    } else {
        goThr = [getNodeByIdRealT("p-1")];
    }

    console.log(goThr[0]);


    var tmp = {};
    tmp[0] = [];
    tmp[1] = [];

    while (goThr.length > 0) {
        var curNode = goThr[0];
        if (typeof(curNode.children) != "undefined") {
            curNode.children.forEach(function(child) {
                if (typeof(child.children) != "undefined") {
                    goThr.push(child);
                } else {
                    tmp[0].push(child);
                }
            }) 
        } else {
            tmp[0].push(curNode);
        }
        goThr.splice(0, 1);
    }

    for (var i = 0; i < tmp[0].length; i ++) {
        if (tmp[0][i].id.startsWith("p-") && !slctPRel[0].includes(tmp[0][i].id)) {
            slctPRel[0].push(tmp[0][i].id);
        }
        tmp[1].push(tmp[0][i].parent);
    }


    for (var i = 0; i < tmp[1].length; i ++) {
        var found = false;
        tmp[1][i].children.forEach(function(child) {
            if (typeof(child.children) != "undefined") {
                found = true;
            }
        })

        if (!found && !slctPRel[1].includes(tmp[1][i].id)) {
            slctPRel[1].push(tmp[1][i].id);
        }
    }

    console.log(slctPRel);

}

function minusLevel() {
    //type4: relative agg:
    //id, +/- (true/flase)
    
    getRLevel();

    if (excludeList.hasOwnProperty(selectedP.id)) {
        alert("Please include the node first, then do the aggregation operation.");
        return ;
    }

    for (var i = 0; i < slctPRel[1].length; i ++) {
        if (!groupList.hasOwnProperty(slctPRel[1][i])) {
            var cList = getAllChildren(getNodeByIdCurT(slctPRel[1][i])[0]);
            groupList[slctPRel[1][i]] = cList;
        }
    }
    if (isEmpty(selectedP)) {
        addOperation(4, [getNodeByIdCurT("p-1"), false]);
    } else {
        addOperation(4, [selectedP, false]);
    }
    zoom(node);
    updateTSChart();
    //updateLineChart();
    lockedHighlight();
    slctedP();
}



function addLevel() {
    //type4: relative agg:
    //id, +/- (true/flase)
    getRLevel();

    if (excludeList.hasOwnProperty(selectedP.id)) {
        alert("Please include the node first, then do the aggregation operation.");
        return ;
    }

    for (var i = 0; i < slctPRel[0].length; i ++) {
        if (groupList.hasOwnProperty(slctPRel[0][i])) {
            delete groupList[slctPRel[0][i]];
            var tmpNode = getNodeByIdCurT(slctPRel[0][i])[0];
            tmpNode.children.forEach(function(c) {
                if (c.id.startsWith("p-") && !groupList.hasOwnProperty(c.id)) {
                    var cList = getAllChildren(c);
                    groupList[c.id] = cList;
                }
            })
        }
    }

    if (isEmpty(selectedP)) {
        addOperation(4, [getNodeByIdCurT("p-1"), true]);
    } else {
        addOperation(4, [selectedP, true]);
    }
    zoom(node);
    updateTSChart();
    //updateLineChart();
    lockedHighlight();
    slctedP();
}


function aggFilChange(radio) {
    console.log(radio.value);
    if (rangStart == 0 && rangEnd == 0) {
        return;
    }
    if (radio.value == "agg") {
        var agg_res = aggLine(rangStart, rangEnd);
        previewTreeLine(agg_res);
    } else {
        var filter_res = filterLine(rangStart, rangEnd);
        previewTreeLine(filter_res);
    }
}

function getCPfromRealT() {

    realTree = buildTree();

    console.log(realTree);


    var goThr = [realTree];
    var curNode;

    var realP = [];
    var realC = [];

    while (goThr.length > 0) {
        curNode = goThr[0];
        if (typeof(curNode.children) != "undefined") {
            if (!realP.includes(curNode.id)) {
                realP.push(curNode.id);
            }
            curNode.children.forEach(function(c) {
                goThr.push(c);
            })
        } else {
            if (!realC.includes(curNode.id)) {
                realC.push(curNode.id);
            }
        }
        goThr.splice(0, 1);
    }

    console.log(realP, realC);
    return [realP, realC];
}


function filterLine(b0, b1) {
    var nodesList = [];

    console.log(b0, b1);
    var s = document.getElementById("brChart");
    var slct = s.options[s.selectedIndex].value;

    curTime.forEach(function(d){
        
        var delta = 0;
        if (slct == "t1v") { 
            delta = d['y'][idx1];
        } else if (slct == "t2v") { 
            delta = d['y'][idx2];
        } else if (slct == "t1t2") { 
            delta = d['y'][idx1] - d['y'][idx2];
        } else if (slct == "t2t1") {
            delta = d['y'][idx2] - d['y'][idx1];
        } else if (slct == "tt12") {
            delta = Math.abs(d['y'][idx2] - d['y'][idx1]);
        }
        console.log(d, delta, idx1, idx2);
        if (delta >= b0 && delta < b1) {
            nodesList.push(d.id);
        }
    });

    console.log(nodesList);

    var filterCLeft = [];
    var filterCOutIds = [];
    var filterPLeftIds = [];
    var filterPLeft = [];

    var nodes = treemap.nodes(root);
    var children = nodes.filter(function(d) {
        return !d.children;
    });
    var parents = nodes.filter(function(d) {
        return d.children;
    });

    children.forEach(function(c) {
        if (nodesList.includes(c.id)) {
            filterCLeft.push(c);
        } else {
            filterCOutIds.push(c.id);
        }
    })

    parents.forEach(function(p) {
        if (nodesList.includes(p.id)) {
            filterPLeft.push(p);
            filterPLeftIds.push(p.id);
        }
    })

    filterCLeft.forEach(function(lc) {
        var p = lc.parent;
        while (typeof(p.parent) != "undefined"){
            if (!filterPLeftIds.includes(p.id)) {
                filterPLeftIds.push(p.id);
            }
            p = p.parent;
        }
        if (!filterPLeftIds.includes(p.id)) {
            filterPLeftIds.push(p.id);
        }
    });

    filterPLeft.forEach(function(lp) {
        var p = lp.parent;
        while (typeof(p.parent) != "undefined"){
            if (!filterPLeftIds.includes(p.id)) {
                filterPLeftIds.push(p.id);
            }
            p = p.parent;
        }
        if (!filterPLeftIds.includes(p.id)) {
            filterPLeftIds.push(p.id);
        }
    });


    filterPLeft.forEach(function(lp) {
        var tmpChild = getAllChildren(lp);
        for (var i = 0; i < tmpChild.length; i ++) {
            var idx = filterCOutIds.indexOf(tmpChild[i]);
            if (idx > -1) {
                filterCOutIds.splice(idx, 1);
            } 
        }
    })


    var filterPOut = {};
    parents.forEach(function(p) {
        if (!filterPLeftIds.includes(p.id)) {
            var tmpList = getAllChildren(p);
            filterPOut[p.id] = tmpList;
        }
    })

    console.log(filterCOutIds, filterPOut);

    return [filterCOutIds, filterPOut, {}];


}

function aggLine(b0, b1) {

    var aggCOutIds = [];
    var aggPOut = {};
    var aggPGR = {};

    var s = document.getElementById("brChart");
    var slct = s.options[s.selectedIndex].value;

    var nodesList = [];

    var s = document.getElementById("brChart");
    var slct = s.options[s.selectedIndex].value;

    curTime.forEach(function(d){
        
        var delta = 0;
        if (slct == "t1v") { 
            delta = d['y'][idx1];
        } else if (slct == "t2v") { 
            delta = d['y'][idx2];
        } else if (slct == "t1t2") { 
            delta = d['y'][idx1] - d['y'][idx2];
        } else if (slct == "t2t1") {
            delta = d['y'][idx2] - d['y'][idx1];
        } else if (slct == "tt12") {
            delta = Math.abs(d['y'][idx2] - d['y'][idx1]);
        }
        if (delta >= b0 && delta < b1) {
            nodesList.push(d.id);
        }
    });

    console.log(nodesList);

    var nodes = treemap.nodes(root);
    var children = nodes.filter(function(d) {
        return !d.children;
    });
    var parents = nodes.filter(function(d) {
        return d.children;
    });

    var aggCLeft = [];
    var aggCOut = [];

    children.forEach(function(c) {
        if(nodesList.includes(c.id)){
            aggCLeft.push(c);
        } else {
            aggCOut.push(c);
            aggCOutIds.push(c.id);
        }
    })

    var aggPLeftIds = [];

    aggCLeft.forEach(function(lc) {
        var p = lc.parent;
        while (typeof(p.parent) != "undefined"){
            if (!aggPLeftIds.includes(p.id)) {
                aggPLeftIds.push(p.id);
            }
            p = p.parent;
        }
        if (!aggPLeftIds.includes(p.id)) {
            aggPLeftIds.push(p.id);
        }
    });

    var aggPG = [];
    var aggPGroup = [];
    var aggPGroupIds = [];

    parents.forEach(function(p) {
        if (!aggPLeftIds.includes(p.id)) {
            var delta = 0;
            if (slct == "t1v") { 
                delta = p['rate'][idx1];
            } else if (slct == "t2v") { 
                delta = p['rate'][idx2];
            } else if (slct == "t1t2") { 
                delta = p['rate'][idx1] - p['rate'][idx2];
            } else if (slct == "t2t1") {
                delta = p['rate'][idx2] - p['rate'][idx1];
            }
            if (delta >= b0 && delta <= b1) {
                aggPG.push(p);
                aggPGroupIds.push(p.id);
            }
        }
    })

    

    aggPG.forEach(function(p) {
        var tmpChildren = getAllChildren(p);
        var found = false;
        for (var i = 0; i < aggPG.length; i ++) {
            if (tmpChildren.includes(aggPG[i].id)) {
                found = true;
                break;
            }
        }

        var tp = p.parent;
        while (typeof(tp.parent) != "undefined"){
            if (groupList.hasOwnProperty(tp.id)){
                found = true;
                break;
            }
            tp = tp.parent;
        }

        if (groupList.hasOwnProperty(tp.id)) {
            found = true;
        }

        if (!found) {
            aggPGroup.push(p);
            aggPGR[p.id] = tmpChildren;
            for (var i = 0; i < tmpChildren.length; i ++) {
                var idx = aggCOutIds.indexOf(tmpChildren[i]);
                if (idx > -1) {
                    aggCOutIds.splice(idx, 1);
                } 
            }
        }
    })

    aggPGroup.forEach(function(gp) {
        var p = gp.parent;
        while (typeof(p.parent) != "undefined"){
            if (!aggPLeftIds.includes(p.id)) {
                aggPLeftIds.push(p.id);
            }
            p = p.parent;
        }
        if (!aggPLeftIds.includes(p.id)) {
            aggPLeftIds.push(p.id);
        }
    });

    parents.forEach(function(p) {
        if (!aggPLeftIds.includes(p.id) && !aggPGroupIds.includes(p.id)) {
            var tmp = getAllChildren(p);
            aggPOut[p.id] = tmp;
        }
    })


    console.log(aggCOutIds, aggPOut, aggPGR);

    return [aggCOutIds, aggPOut, aggPGR];

}


function getColor(d) {
    var choseColor;
    var s = document.getElementById("colorBy");
    var slct = s.options[s.selectedIndex].value;
    d = d[0];
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
            choseColor = color1c(Math.sqrt(Math.sqrt(d.rate[idx1])));
        } else if (d.id.startsWith('p-')) {
            choseColor = color1p(Math.sqrt(Math.sqrt(d.rate[idx1])));
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
        if (d.rate[idx1] - d.rate[idx2] > 0) {
            choseColor = color3(Math.min(2, ((d.rate[idx1] - d.rate[idx2]) / Math.max(1, d.rate[idx2]))));
        } else {
            choseColor = color3(Math.max(-2, ((d.rate[idx1] - d.rate[idx2]) / Math.max(1, d.rate[idx2]))));
        }
        
    } else if (slct == "pdiff21") {
        if (d.rate[idx2] - d.rate[idx1] > 0) {
            choseColor = color3(Math.min(2, ((d.rate[idx2] - d.rate[idx1]) / Math.max(1, d.rate[idx1]))));
        } else {
            choseColor = color3(Math.max(-2, ((d.rate[idx2] - d.rate[idx1]) / Math.max(1, d.rate[idx1]))));
        }   
    }
    return choseColor;
}

function applyBrush() {
    var selection = document.getElementsByName("select");
    var chosen;
    for (var i = 0; i < selection.length; i ++) {
        if (selection[i].checked) {
            chosen = selection[i].value;
            break;
        }
    }

    var auto_c = [];
    var auto_e = [];
    var auto_g = [];

    var name = "";

    if (chosen == "agg") {
      var res = aggLine(rangStart, rangEnd);
      auto_c = res[0];
      auto_e = res[1];
      auto_g = res[2];

      name = "Aggregation";

    } else if (chosen == "filter") {
      var res = filterLine(rangStart, rangEnd);
      auto_c = res[0];
      auto_e = res[1];
      auto_g = {};

      name = "Filter";
    }

    console.log(auto_c, auto_e, auto_g);

    for (var i = 0; i < auto_c.length; i ++) {
        if (!cancelList.includes(auto_c[i])) {
            cancelList.push(auto_c[i]);
        }
    }

    for (var key in auto_e) {
        //if (groupList.hasOwnProperty(key)) {
        //    delete groupList[key];
        //}
        if (!excludeList.hasOwnProperty(key)) {
            excludeList[key] = [];
            for (var i = 0; i < auto_e[key].length; i ++) {
                excludeList[key].push(auto_e[key][i]);
            }
        }
    }

    for (var key in auto_g) {
        if (!groupList.hasOwnProperty(key)) {
            groupList[key] = [];
            for (var i = 0; i < auto_g[key].length; i ++) {
                groupList[key].push(auto_g[key][i]);
            }
        }
    }

    console.log(cancelList, excludeList, groupList);

    var b = document.getElementById("brChart");
    var bar = b.options[b.selectedIndex].value;
    var barStr = ""
    if (bar == "t1v") {
        barStr = "T1 Value";
    } else if (bar == "t2v") {
        barStr = "T2 Value";
    } else if (bar =="t1t2") {
        barStr = "T1 Value - T2 Value";
    } else if (bar == "t2t1") {
        barStr = "T2 Value - T1 Value";
    } else if (bar == "tt12") {
        barStr = "Absolute Diff between T1 and T2 (|T1 - T2|)"
    }

    console.log(name, barStr, rangStart, rangEnd);
    addOperation(2, [name, barStr, rangStart, rangEnd]);
    

    zoom(node);
    updateTSChart();
    //updateLineChart();
    slctedP();
    lockedHighlight();
}