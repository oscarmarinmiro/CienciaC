var ccviz = ccviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };

ccviz.viz.circularTree = function(options) {

    var self = {};


    // Get options data

    for (key in options){
        self[key] = options[key];
    }

    console.log("OPTIONS");


    self.init = function() {

//        self.diameter = $(window).height() > $(window).width() ? $(window).width(): $(window).height();
//        self.diameter = $(window).width();


        var _mousemove = function () {
            self.tooltip
                    .style("left", (d3.event.pageX + 20) + "px")
                    .style("top", (d3.event.pageY - 12) + "px");
        };

        self.tree = d3.layout.tree()
            .size([360, self.diameter / 2 - 60])
            .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

        self.diagonal = d3.svg.diagonal.radial()
            .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

        self.svg = d3.select("body").append("svg")
            .attr("width", self.diameter)
            .attr("height", self.diameter)
          .append("g")
            .on("mousemove", _mousemove)
            .attr("transform", "translate(" + self.diameter / 2 + "," + self.diameter / 2 + ")");

        self.tooltip = d3.select("body").append("div")
                .attr("id", "tooltip")
                .html("")
                .attr("class", "tooltip_viz")
                .style("opacity", 0);

    };



    self.get_info_from_node = function(d){
        var my_html = "";

        var original_data = d;

        var names = [];

        while(d.name!= "root"){
            names.unshift(d.name=="1"? "UP":"DOWN");
            d = d.parent;
        }

        var market_seq = names.join("/");

        console.log(names);

        console.log(d);

        d = original_data;

        my_html+= "Market sequence: " + market_seq + "</br>";

        my_html+= "Success ratio: " + d.average.toFixed(2) + "</br>" + "Number of cases: " + d.size + "</br>";

        return my_html;
    };

    self.render = function (file_path) {

        d3.json(file_path, function (error, json) {
            if (error) throw error;

             var nodes = self.tree.nodes(json),
                  links = self.tree.links(nodes);


              var min_size = d3.min(nodes, function(d,i){return d.size;});
              var max_size = d3.max(nodes, function(d,i){return d.size;});

              var size_scale = d3.scale.log().domain([min_size,max_size]).range([0.0,1.0]).clamp(true);
              var avg_scale = d3.scale.log().domain([min_size,max_size]).range([0.0,1.0]).clamp(true);

              console.log(min_size);
              console.log(max_size);

              var link = self.svg.selectAll(".link")
                  .data(links.filter(function(d,i){ return d.source.depth!=0}))
                .enter().append("path")
                  .attr("class", "link")
                  .attr("d", self.diagonal);

              var node = self.svg.selectAll(".node")
                  .data(nodes.filter(function(d,i){ return d.depth!=0}))
                .enter().append("g")
                  .attr("class", "node")
//                  .attr("opacity", function(d,i){return opacity_scale(d.size);})
                  .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
                .on("mouseover", function (d, i) {
                    self.tooltip.style("opacity", 1.0);
                    self.tooltip.html(self.get_info_from_node(d));
                })
                .on("mouseout", function (d, i) {
                    self.tooltip.style("opacity", 0.0);
                });


//              node.append("circle")
//                      .style("fill", function(d,i){
//                            return d.name=="-1" ? "#FF1919": "#00B233";
//                      })
//                  .attr("r", 9.0);
//
//              node.append("circle")
//                      .style("fill", function(d,i){
//                            return d.name=="-1" ? "#FF1919": "#00B233";
//                      })
//                  .attr("r", 9.0);

            node.append("image")
                .attr("class", "minus")
                .attr("x", "-10")
                .attr("y", "-10")
                .attr("width", "20px")
                .attr("height", "20px")
                .attr("xlink:href", function(d,i){return d.name=="-1" ? "img/arrow_down.png": "img/arrow_up.png";});

              node.append("text")
                  .attr("dy", ".31em")
                      .attr("x", function(d) { return d.x < 180 ? 5 : -5; })
                  .attr("y", -5)
                  .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
                  .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
                  .text(function(d) { return "s=" + d.average.toFixed(2)});

              node.append("text")
                  .attr("dy", ".31em")
                      .attr("x", function(d) { return d.x < 180 ? 5 : -5; })
                  .attr("y", 5)
                  .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
                  .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
                  .text(function(d) { return "q=" + d.size; });


        });


    };

    // Object's main

    self.init();

    return self;
};

