$(document).ready(function() {
    var width = 1000;
    var height = 560;
    var circle = null;
    var x = d3.scale.ordinal().rangePoints([0, width], 1);
    var continents = {
      'Latin America and the Caribbean': {x: 300, y: 380, color: '#FFAA00'},
      'Oceania': {x: 840, y: 450, color: '#FFAA00'},
      'Northern America': {x: 220, y: 180, color: '#FFAA00'},
      'Europe': {x: 500, y: 190, color: '#FFAA00'},
      'Asia': {x: 730, y: 250, color: '#FFAA00'},
      'Africa': {x: 510, y: 320, color: '#FFAA00'}
    }
    var visibleData = expertsData.map(function(obj, y) {
      obj.id = y;
      obj.radius = 6;
      obj.color = continents[obj['AFFILIATION 1']].color;
      obj.cx = continents[obj['AFFILIATION 1']].x;
      obj.cy = continents[obj['AFFILIATION 1']].y;

      return obj;
    });
    var svg = d3.select("#map-wrapper").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("position", "absolute");
    var force = d3.layout.force()
        .nodes(visibleData)
        .size([width, height])
        .gravity(0)
        .charge(0);

    function update() {
      circle = svg.selectAll("circle")
        .data(visibleData, function(d) { return d.id; });

      circle.enter()
        .append("circle")
        .attr("r", function(d) { return d.radius; })
        .style("fill", function(d) { return d.color; })
        .call(force.drag);

      circle.exit().remove();

      force.on("tick", function(e) {
        circle.each(gravity(0.005))
          .each(collide(0.3))
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
      })

      force.start();
    }

    function gravity(alpha) {
      return function(d, i) {
        d.y += (d.cy - d.y) * alpha;
        d.x += (d.cx - d.x) * alpha;
      };
    }

    function collide(alpha) {
      var quadtree = d3.geom.quadtree(visibleData);
      return function(d) {
        var r = d.radius,
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
        quadtree.visit(function(quad, x1, y1, x2, y2) {
          if (quad.point && (quad.point !== d)) {
            var x = d.x - quad.point.x,
                y = d.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius + quad.point.radius + (d.color !== quad.point.color);
            if (l < r) {
              l = (l - r) / l * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
      };
    }

    update();

    // Filters
    // -------

    d3.selectAll(".filters1 .checkbox").on("change", function() {
      var val = this.value;

      if (!this.checked) {
        var aux = [];

        visibleData.forEach(function(obj) {
          if (obj['AFFILIATION 2'] !== val) {
            aux.push(obj);
          }
        });
        visibleData = aux;
      } else {
        var filters2 = d3.selectAll('.filters2 .checkbox:checked')[0].map(function(elem) {
          return elem.value;
        });

        expertsData.forEach(function(obj) {
          var bit1 = filters2.indexOf(obj['CONFERENCE 2 ATTENDED']) >= 0;
          var bit2 = filters2.indexOf(obj['CONFERENCE 3 ATTENDED']) >= 0;

          if (val === obj['AFFILIATION 2'] && (bit1 || bit2)) {
            delete obj.x;
            delete obj.px;
            delete obj.y;
            delete obj.py;
            visibleData.push(obj);
          }
        });
      }
      update();
    });

    d3.selectAll(".filters2 .checkbox").on("change", function() {
      var val = this.value;

      if (!this.checked) {
        var aux = [];

        visibleData.forEach(function(obj) {
          if (obj['CONFERENCE 2 ATTENDED'] !== val && obj['CONFERENCE 3 ATTENDED'] !== val) {
            aux.push(obj);
          }
        });
        visibleData = aux;

      } else {
        var filters1 = d3.selectAll('.filters1 .checkbox:checked')[0].map(function(elem) {
          return elem.value;
        });

        expertsData.forEach(function(obj) {
          var bit1 = filters1.indexOf(obj['AFFILIATION 2']) >= 0;
          var bit2 = val === obj['CONFERENCE 2 ATTENDED'];
          var bit3 = val === obj['CONFERENCE 3 ATTENDED'];

          if ((bit2 || bit3) && bit1) {
            delete obj.x;
            delete obj.px;
            delete obj.y;
            delete obj.py;
            visibleData.push(obj);
          }
        });
      }
      update();
    });
});