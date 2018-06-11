var brush;
var pro_data;
var rangStart = 0, rangEnd = 0;
var resHighLight = [];


function getDis(diff) {
  var oriB = 20;
  var gap = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];
  for (var i = 0; i < gap.length; i ++) {
    if (diff <= gap[i] * oriB) {
      return gap[i];
    }
  }
}

function dis_chart(rawData) {
    var svg3Margin, svg3Width, svg3Height, svg3x, svg3y;
    //console.log(data.length);
    var xPoints, yPoints, range2count;
    var xStartPos = 1000; //600;
    var xlabel;
    var s = document.getElementById("brChart");
    var slct = s.options[s.selectedIndex].value;
    if (slct == "t1v") { 
        xlabel = 'T1 Value';
    } else if (slct == "t2v") { 
      xlabel = 'T2 Value';
    } else if (slct == "t1t2") { 
      xlabel = '(T1 - T2)';
    } else if (slct == "t2t1") {
      xlabel = '(T2 - T1)';
    } else if (slct == "tt12") {
      xlabel = '|T2 - T1|';
    }

    pro_data = function () {
      range2count = [];

      var data = rawData;
      d3.select('#nodeInfo').text("Number of Current Leave Nodes:" + data.length);

      var min = Math.min.apply(null, data);
      var max = Math.max.apply(null, data);

      if (data.length == 1 || (min == max)) {
            range2count.push({
                'label': data[0].toString(),
                'count': data.length
            });
            draw_dis_chart(range2count);
            return ;
      }

      xPoints = [];

      var dis = getDis(max - min);
      console.log(max, min, dis);

      var tmp_min = Math.floor(min / dis) * dis;
      var tmp_max = Math.ceil(max / dis) * dis;

      for (var x = tmp_min; x <= tmp_max; x += dis) {
        xPoints.push(x);
      }

      yPoints = [];

      for (var i = 0; i < xPoints.length - 1; i ++) {
        yPoints.push(0);
      }

      data.forEach(function(d) {
        for (var i = 0; i < yPoints.length; i ++) {
          if (i == yPoints.length - 1) {
            yPoints[i]  += 1;
            break;
          }
          if (d >= xPoints[i] && d < xPoints[i + 1]) {
            yPoints[i] += 1;
            break;
          }
        }
      })

      for (var i = 0; i < yPoints.length; i ++) {
        var x1 = xPoints[i].toString();
        var x2 = xPoints[i + 1].toString();
        range2count.push({
            "label": x1 + '~' + x2,
            "count": yPoints[i]
        })
      }

      draw_dis_chart(range2count);
      
    }

    pro_data();


    function draw_dis_chart(range2count) {
      svg_dischart = d3.select("#dischart");
        svg_dischart.selectAll("*").remove();

        svg3Margin = {top: 15, right: 30, bottom: 25, left: 60},
        svg3Width = 1000 - svg3Margin.left - svg3Margin.right, //600 - svg3Margin.left - svg3Margin.right,
        svg3Height = 380 - svg3Margin.top - svg3Margin.bottom; //160 - svg3Margin.top - svg3Margin.bottom;

        svg3x = d3.scale.ordinal()
            .rangeRoundBands([0, svg3Width]);
        
        svg3y = d3.scale.sqrt()
            .range([svg3Height, 0]);
        
        var svg3xAxis = d3.svg.axis()
            .scale(svg3x)
            .orient("bottom");
        
        var svg3yAxis = d3.svg.axis()
            .scale(svg3y)
            .orient("left");
        
        //d3.select(".chart").selectAll("*").remove();
        svg_dischart = d3.select("#dischart")
            .attr("width", svg3Width + svg3Margin.left + svg3Margin.right)
            .attr("height", svg3Height + svg3Margin.top + svg3Margin.bottom)
          .append("g")
          .attr("transform", "translate(" + svg3Margin.left + "," + svg3Margin.top + ")");;
        
        svg3x.domain(range2count.map(function(d) { return d.label; }));
        svg3y.domain([0, d3.max(range2count, function(d) { return d.count; })]);
        
        
        svg_dischart.selectAll(".bar")
            .data(range2count)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { 
                if (svg3x(d.label) < xStartPos) {
                    xStartPos = svg3x(d.label);
                }
                return svg3x(d.label); 
            })
            .attr("y", function(d) { return svg3y(d.count); })
            .attr("height", function(d) { return svg3Height - svg3y(d.count); })
            .attr("width", svg3x.rangeBand());
    
        svg_dischart.append("g")
            .attr("class", "x axis dis")
            .attr("transform", "translate(0," + svg3Height + ")")
            .call(svg3xAxis)
            .append("text")
            .attr("dy", "-.71em")
            .attr("x", svg3Width)
            .style("text-anchor", "end")
            .text(xlabel)
            .style("font-weight", "bold");
        
        svg_dischart.append("g")
            .attr("class", "y axis dis")
            .call(svg3yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Count")
            .style("font-weight", "bold");
                    
    
        var hideTicksWithoutLabel = function() {
            var count = 0;
            if (typeof(xPoints) == "undefined") {
                return ;
            }

            d3.selectAll('.x.axis.dis .tick text').each(function(d){
              if (this.innerHTML.indexOf('~') == -1) {
                return ;
              }
              var f = this.innerHTML.split('~')[0];
              var b = this.innerHTML.split('~')[1];
              if (f.indexOf('000000') != -1) {
                f = f.slice(0, -6) + 'M';
              } else if (f.indexOf('000') != -1) {
                f = f.slice(0, -3) + 'k';
              }
              if (b.indexOf('000000') != -1) {
                b = b.slice(0, -6) + 'M';
              } else if (b.indexOf('000') != -1) {
                b = b.slice(0, -3) + 'k';
              }

              //if (f == '0' || b == '0') {
              //  d3.select(this).style('font-weight', 'bold');
              //}

              this.innerHTML = f + '~' + b;
            });
            
            d3.selectAll('.y.axis.dis .tick text').each(function(d){
                //console.log(this.innerHTML, typeof(this.innerHTML));
                if (this.innerHTML.includes('.') && !this.innerHTML.includes('.0')) {
                    this.parentNode.style.display = 'none';
                }
                if (this.innerHTML.includes('.')) {
                    this.innerHTML = this.innerHTML.slice(0, -2);
                }
            })
        }
    
        hideTicksWithoutLabel();


        brush = d3.svg.brush()
                      .x(svg3x)
                      .on("brush", brushmove)
                      .on("brushend", brushend);

        var brushg = svg_dischart.append("g")
            .attr("class", "brush")
            .call(brush);
        
        // set brush extent to rect and define objects height
        brushg.selectAll("rect")
            .attr("height", svg3Height);
    }

    function brushmove() {

      if (brush.empty()) {
        rangStart = 0;
        rangEnd = 0;
        previewTreeLine([]);
        brush.clear();
        d3.selectAll("rect.bar").style("opacity", function(d, i) {
          return "1";
        });
        return ;
      }



      b = brush.extent();
      var barW = svg3x.rangeBand();
      var b0x = Math.round(b[0]/ barW);
      var b1x = Math.round(b[1] / barW);
      var newb0x = b0x * barW + xStartPos;
      var newb1x = b1x * barW + xStartPos;

      d3.selectAll("rect.bar").style("opacity", function(d, i) {
        if (i >= b0x && i < b1x) {
          return "1";
        } else {
          return "0.2";
        }
      });

      d3.select("g.brush").call(brush.extent([newb0x, newb1x]));


    }
    
    function brushend() {
      // console.log('NOTE: brushend event is triggered');
      //console.log('Is the brush empty: ' + brush.empty());
      //brush selection start:
      var selection = document.getElementsByName("select");
      var chosen;
      for (var i = 0; i < selection.length; i ++) {
          if (selection[i].checked) {
              chosen = selection[i].value;
              break;
          }
      }
      //brush selection end
      if (brush.empty()) {
        rangStart = 0;
        rangEnd = 0;
        previewTreeLine([]);
        brush.clear();
        d3.selectAll("rect.bar").style("opacity", function(d, i) {
          return "1";
        });
        return ;
      }
      b = brush.extent();
      var barW = svg3x.rangeBand();
      var b0x = Math.round(b[0] / barW);
      var b1x = Math.round(b[1] / barW);
      //var newb0x = b0x * barW + xStartPos;
      //var newb1x = b1x * barW + xStartPos;
      console.log(b, b[0], b[1], barW, b0x, b1x, range2count)
      var b0 = Number(range2count[b0x]["label"].slice(0, range2count[b0x]["label"].indexOf('~')));
      var b1 = Number(range2count[b1x - 1]["label"].substring(range2count[b1x - 1]["label"].indexOf('~') + 1));
      console.log(b0, b1);
      rangStart = b0;
      rangEnd = b1;

      d3.selectAll("rect.bar").style("opacity", function(d, i) {
        if (i >= b0x && i < b1x) {
          return "1";
        } else {
          return "0.2";
        }
      });


      if (chosen == "agg") {
        console.log("agg");
        var agg_res = aggLine(b0, b1);
        previewTreeLine(agg_res);
      } else if (chosen == "filter") {
        console.log("filter");
        var filter_res = filterLine(b0, b1);
        previewTreeLine(filter_res);

      }
    }

}

function previewTreeLine(res) {
    resHighLight = res;
    console.log("preview");
    console.log(res);
    var preview_c = [];
    var preview_e = {};
    var preview_g = {};

    if (res.length != 0) {
      preview_c = res[0];
      preview_e = res[1];
      preview_g = res[2];
    } 

    console.log(preview_c, preview_e, preview_g);

    var pout = [];
    var pgroup = [];
    var cout = [];
    var cnoshow = [];

    for (var key in preview_e) {
      if (!pout.includes(key)) {
        pout.push(key);
      }
      for (var i = 0; i < preview_e[key].length; i ++) {
        if (!cnoshow.includes(preview_e[key][i])) {
          cnoshow.push(preview_e[key][i]);
        }
      }
    }

    for (var key in preview_g) {
      if (!pgroup.includes(key)) {
        pgroup.push(key);
      }
      for (var i = 0; i < preview_g[key].length; i ++) {
        if (!cnoshow.includes(preview_g[key][i])) {
          cnoshow.push(preview_g[key][i]);
        }
      }
    }

    for (var i = 0; i < preview_c.length; i ++) {
      if (!cout.includes(preview_c[i])) {
        cout.push(preview_c[i]);
      }
    }

    for (var i = 0; i < cancelList.length; i ++) {
      if (!cout.includes(cancelList[i])) {
        cout.push(cancelList[i]);
      }
    }

    for (var key in groupList) {
      if (!pgroup.includes(key)) {
        pgroup.push(key);
      }
    }

    for (var key in excludeList) {
      if (!pout.includes(key)) {
        pout.push(key);
      }
    }

    svg_linechart.selectAll(".d3_xy_chart_line").select('path')[0].forEach(function(p){

      var curId = p.classList[0].slice(0, -5);

      if (pout.includes(curId) || cout.includes(curId)) {
        d3.select(p).style('opacity', 0.2);
      } else {
        d3.select(p).style('opacity', 1);
      }

    })

    svg_linechart.selectAll(".d3_xy_chart_line").select('text')[0].forEach(function(t){

      var curId = t.classList[0].slice(0, -5);

      if (pout.includes(curId) || cout.includes(curId)) {
        d3.select(t).style('opacity', 0.2);
      } else {
        d3.select(t).style('opacity', 1);
      }

    })


    chart.selectAll(".cell.parent")[0].forEach(function(p) {

      var curId = d3.select(p).select('rect')[0][0].classList[0];

      if (pout.includes(curId)) {
        d3.select(p).select('rect')
          .attr('opacity', 0.2);
      } else {
        d3.select(p).select('rect')
          .attr('opacity', 1);
      }
      
      if (pgroup.includes(curId)) {
        pcolor = getColor(getNodeByIdCurT(curId));
        d3.select(p).select('rect')
          .style('fill', pcolor);
      } else {
        d3.select(p).select('rect')
          .style('fill', headerColor);
      }

    });

    chart.selectAll(".cell.child")[0].forEach(function(g){ 

      var curId = d3.select(g).select('.background')[0][0].classList[0];

      if (cnoshow.includes(curId)) {
        d3.select(g).select('.background')
          .style("display", "none");
        d3.select(g).select('.foreignObject')
          .style("display", "none");
      } else {
        d3.select(g).select('.background')
          .style("display", "block");
        d3.select(g).select('.foreignObject')
          .style("display", "block");
      }

      if (cout.includes(curId)) {
        d3.select(g).select('.background')
          .attr('opacity', 0.2);
      } else {
        d3.select(g).select('.background')
          .attr('opacity', 1);
      } 
  
    })



}