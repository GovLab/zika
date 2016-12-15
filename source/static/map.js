$(document).ready(function() {

  // Map
  // ---

  var width = 1000;
  var height = 560;
  var circle = null;
  var x = d3.scale.ordinal().rangePoints([0, width], 1);

  var continents = {
    'Latin America and the Caribbean': {x: 300, y: 380},
    'Oceania': {x: 840, y: 450},
    'Northern America': {x: 220, y: 180},
    'Europe': {x: 500, y: 190},
    'Asia': {x: 730, y: 250},
    'Africa': {x: 510, y: 320}
  };

  var visibleData = expertsData.map(function(obj, y) {
    obj.radius = 6;
    obj.color = '#FFAA00';
    obj.cx = continents[obj['REGION']].x;
    obj.cy = continents[obj['REGION']].y;

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

  function updateForce() {
    circle = svg.selectAll("circle")
      .data(visibleData, function(d) { return d.ID; });

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
    });

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
      var r = d.radius;
      var nx1 = d.x - r;
      var nx2 = d.x + r;
      var ny1 = d.y - r;
      var ny2 = d.y + r;

      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x;
          var y = d.y - quad.point.y;
          var l = Math.sqrt(x * x + y * y);
          var r = d.radius + quad.point.radius + (d.color !== quad.point.color);

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

  updateForce();
  updateCounters();

  // Map filters
  // -----------

  $('.filters1 .checkbox').on('change', function() {
    var val = this.value;

    if (!this.checked) {
      var aux = [];

      visibleData.forEach(function(obj) {
        if (obj['AFFILIATION 1'] !== val) {
          aux.push(obj);
        }
      });

      visibleData = aux;

      $('tr.' + slug(val)).hide();
      $(this).parent().removeClass('button--active');
      $(this).parent().addClass('button--inactive');

    } else {
      var filters2 = d3.selectAll('.filters2 .checkbox:checked')[0].map(function(elem) {
        return elem.value;
      });

      expertsData.forEach(function(obj) {
        var bit1 = !obj['CONFERENCE 1 ATTENDED'] || filters2.indexOf(obj['CONFERENCE 1 ATTENDED']) >= 0;
        var bit2 = !obj['CONFERENCE 2 ATTENDED'] || filters2.indexOf(obj['CONFERENCE 2 ATTENDED']) >= 0;
        var bit3 = !obj['CONFERENCE 3 ATTENDED'] || filters2.indexOf(obj['CONFERENCE 3 ATTENDED']) >= 0;

        if (val === obj['AFFILIATION 1'] && (bit1 && bit2 && bit3)) {
          delete obj.x;
          delete obj.px;
          delete obj.y;
          delete obj.py;
          visibleData.push(obj);
        }
      });

      $('tr.' + slug(val)).show();
      $(this).parent().removeClass('button--inactive');
      $(this).parent().addClass('button--active');
    }

    if ($('.filters1 .checkbox:checked').length === 0) {
      resetFilters('filters1');

      return false;
    }

    updateForce();
    updateCounters();
    updateRowsColor();
  });

  $('.filters2 .checkbox').on('change', function() {
    var val = this.value;

    if (!this.checked) {
      var aux = [];

      visibleData.forEach(function(obj) {
        var b01 = obj['CONFERENCE 1 ATTENDED'] !== val;
        var b02 = obj['CONFERENCE 2 ATTENDED'] !== val;
        var b03 = obj['CONFERENCE 3 ATTENDED'] !== val;

        if (b01 && b02 && b03) {
          aux.push(obj);
        }
      });

      visibleData = aux;

      $('tr.' + slug(val)).hide();
      $(this).parent().removeClass('button--active');
      $(this).parent().addClass('button--inactive');

    } else {
      var filters1 = d3.selectAll('.filters1 .checkbox:checked')[0].map(function(elem) {
        return elem.value;
      });
      var filters2 = d3.selectAll('.filters2 .checkbox:checked')[0].map(function(elem) {
        return elem.value;
      });

      expertsData.forEach(function(obj) {
        var bit1 = val === obj['CONFERENCE 1 ATTENDED'];
        var bit2 = val === obj['CONFERENCE 2 ATTENDED'];
        var bit3 = val == obj['CONFERENCE 3 ATTENDED'];
        var bit4 = !obj['CONFERENCE 1 ATTENDED'] || filters2.indexOf(obj['CONFERENCE 1 ATTENDED']) >= 0;
        var bit5 = !obj['CONFERENCE 2 ATTENDED'] || filters2.indexOf(obj['CONFERENCE 2 ATTENDED']) >= 0;
        var bit6 = !obj['CONFERENCE 3 ATTENDED'] || filters2.indexOf(obj['CONFERENCE 3 ATTENDED']) >= 0;
        var bit7 = filters1.indexOf(obj['AFFILIATION 1']) >= 0;

        if ((bit1 || bit2 || bit3) && bit4 && bit5 && bit6 && bit7) {
          delete obj.x;
          delete obj.px;
          delete obj.y;
          delete obj.py;
          visibleData.push(obj);
        }
      });

      $('tr.' + slug(val)).show();
      $(this).parent().removeClass('button--inactive');
      $(this).parent().addClass('button--active');
    }

    if ($('.filters2 .checkbox:checked').length === 0) {
      resetFilters('filters2');

      return false;
    }

    updateForce();
    updateCounters();
    updateRowsColor();
  });

  $('.reset-filters1').click(function() {
    resetFilters('filters1');
  });

  $('.reset-filters2').click(function() {
    resetFilters('filters2');
  });

  // Table
  // -----

  // Populate table
  expertsData.forEach(function(obj) {
    var $tr = $('<tr>');
    var lst = [];

    $tr.data('name', slug(obj['NAME']));
    $tr.addClass(slug(obj['AFFILIATION 1']));

    if (obj['CONFERENCE 1 ATTENDED']) {
      $tr.addClass(slug(obj['CONFERENCE 1 ATTENDED']));
      lst.push(obj['CONFERENCE 1 ATTENDED']);
    }

    if (obj['CONFERENCE 2 ATTENDED']) {
      $tr.addClass(slug(obj['CONFERENCE 2 ATTENDED']));
      lst.push(obj['CONFERENCE 2 ATTENDED']);
    }

    if (obj['CONFERENCE 3 ATTENDED']) {
      $tr.addClass(slug(obj['CONFERENCE 3 ATTENDED']));
      lst.push(obj['CONFERENCE 3 ATTENDED']);
    }

    $tr.append($('<td>'));
    $tr.append($('<td>').text(obj['NAME']).addClass('name-column'));
    $tr.append($('<td>').text(obj['AFFILIATION 1']).addClass('sector-column'));
    $tr.append($('<td>').text(lst.join(', ')).addClass('topic-column'));
    $tr.append($('<td>').text(obj['ORGANIZATION']).addClass('organization-column'));

    $('.table-sortable').append($tr);
  });

  // Table search input
  $('.js-open-table-search').click(function(e) {
    $(this).parent().siblings('.table-sortable__search').toggleClass('table-sortable__search--active');
  });

  var searchButtons = $('.table-sortable__search').find("button[type='submit']")

  searchButtons.on("click", function(e) {
      e.preventDefault();
      if ($(this).parent().hasClass("table-sortable__search--active")) {
        $(this).parent().removeClass("table-sortable__search--active")
        $(".search").val("");
        $('tbody tr').show();
      }
  })

  $("body").keyup(function(event) {
      if ( event.keyCode == "27" ) {
        $(this).parent().find('.table-sortable__search').removeClass("table-sortable__search--active");
        $(".search").val("");
        $('tbody tr').show();
      }
  });

  // Table search
  $('#expert__name--input').on('keyup', function() {
    var term = $(this).val();

    $('tbody tr').each(function(i, row) {
      var name = $(row).data('name');

      if (name.indexOf(term) !== -1) {
        $(row).show();
      } else {
        $(row).hide();
      }
    });

    updateRowsColor();
  });

  // Sort icons
  var sortClickButtons = $(".table-sortable__control > i:contains('keyboard_arrow_down')");

  sortClickButtons.on("click", function() {
    if ($(this).text() == "keyboard_arrow_down") {
      $(this).text("keyboard_arrow_up");
    } else {
      $(this).text("keyboard_arrow_down");
    }
  });

  // Sort
  $('thead th').each(function() {
    var th = $(this).closest('th');
    var thIndex = th.index();
    var inverse = false;

    th.find('.sort').click(function() {
      $('table').find('td').filter(function() {
        return $(this).index() === thIndex;
      }).sortElements(function(a, b){
        if( $.text([a]) == $.text([b]) )
          return 0;
        return $.text([a]) > $.text([b]) ?
          inverse ? -1 : 1
          : inverse ? 1 : -1;
      }, function() {
        return this.parentNode;
      });

      inverse = !inverse;
    });
  });

  // Etc
  // ---

  function slug(string) {
    return string.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');
  }

  function updateRowsColor() {
    $('tr:visible').each(function(i, row) {
      if (i % 2) {
        $(row).css('background-color', '#f2f2f2');
      } else {
        $(row).css('background-color', '#ffffff');
      }
    });
  }

  function updateCounters() {
    Object.keys(continents).forEach(function(val, i) {
      var count = visibleData.filter(function(obj) { return obj['REGION'] === val }).length;


      $('.dashboard__item.' + slug(val) + ' span').text(count);
    });
  }

  function resetFilters(filter) {
    $('.' + filter + ' .button--inactive').each(function() {
      $(this).removeClass('button--inactive');
      $(this).addClass('button--active');
      $(this).find('.checkbox').prop('checked', true);
      $(this).find('.checkbox').trigger('change');
    });
  }
});