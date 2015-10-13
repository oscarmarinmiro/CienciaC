var ccviz = ccviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };

ccviz.viz.circularTree = function(options) {

    var self = {};


    // Get options data

    for (key in options){
        self[key] = options[key];
    }

    console.log("OPTIONS");

    // Object to store deactivated sequences

    self.deactivated = {};


    self.init = function() {

//        self.diameter = $(window).height() > $(window).width() ? $(window).width(): $(window).height();
//        self.diameter = $(window).width();

        self.diameter = self.diameter - self.chart_margin;


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


    self.get_sequence_from_node = function(d){

        var names = [];

        while(d.name!= "root"){
            names.unshift(d.name=="1"? "UP":"DOWN");
            d = d.parent;
        }

        return names.join("/");

    };

    self.get_info_from_node = function(d){

        var my_html = "";

        var market_seq = self.get_sequence_from_node(d);

        my_html+= "Market sequence: " + market_seq + "</br>";

        my_html+= "Success ratio: " + d.average.toFixed(2) + "</br>" + "Number of cases: " + ((d.size / self.max_size)*100).toFixed(2) + "%" + "</br>";

        return my_html;
    };

//    self.select_a_sequence = function(sequence){
//
//        d3.selectAll(".node").filter(function(d,i){
//
//            var candidate = self.get_sequence_from_node(d).indexOf(sequence)==0;
//
//            var hidden_by = d3.select(this).attr("hidden_by");
//
//            if(hidden_by==null && candidate){
//                return candidate;
//            }
//            else{
//
//                return (candidate && hidden_by.length==sequence.length) ? true: false;
//            }
//
//        }).classed("selected_hidden", false);
//
//    };

    self.deselect_a_sequence = function(sequence){

        d3.selectAll(".node").filter(function(d,i){

            return self.get_sequence_from_node(d).indexOf(sequence)==0;

        }).classed("selected_hidden", true);

    };

    self.unhide_all_sequences = function(){

        d3.selectAll(".node").classed("selected_hidden", false)

    };


    self.select_nodes_with_sequence = function(node_sequence){

        d3.selectAll(".node").each(function(d,i){

            var node = d3.select(this);

            var over = self.get_sequence_from_node(d).indexOf(node_sequence)==0;

            node.classed("over", over);
            node.classed("non_over", !over);

        });

    };

    self.reset_selected_nodes = function(){

        d3.selectAll(".node").classed("over", false).classed("non_over", false);

    };


    self.set_node_table = function (nodes){


        function get_arrows_html(d) {

            var names = [];

            while (d.name != "root") {
                names.unshift(d.name == "1" ? '<img class="node_arrow" src="img/arrow_up.png">' : '<img class="node_arrow" src="img/arrow_down.png">');
                d = d.parent;
            }

            return names.join(" ");

        }


        var new_nodes = [];

        $.each(nodes, function(i,d){

            // Do not insert if root
            if(d.depth!=0) {
                new_nodes.push(d);
            }
        });

        // Sort by frequency
        // TODO: Define in the UI != sort possibilities

        new_nodes.sort(function (a,b){

            return (b.size - a.size);

        });

        var node_panel = d3.select("#node_list");

        var my_html = "";

        $.each(new_nodes, function(i,d){

            var node_html ="";

//            node_html+='<div class="node_row">';
                node_html+='<div class="node_check"><input class="sequence_check" type="checkbox" checked="checked" /></div>';
                    node_html+='<div class="node_arrows">';
                    node_html+= get_arrows_html(d);
                    node_html+='</div>';
                node_html+='<div class="node_info">';
                    node_html+='<div class="node_freq">q:' + ((d.size / self.max_size)*100).toFixed(2) + "%" +'</div>';
                    node_html+='<div class="node_prob">s:' + d.average.toFixed(2) +'</div>';
                node_html+='</div>';
            node_html+='</div>';

            node_html+='<div style="clear:both;"></div>';

            var node_string = self.get_sequence_from_node(d);

//            my_html+='<div class="node_row">'+ node_html;


            my_html+='<div class="node_row" sequence="'+ node_string + '">' + node_html;



        });

        node_panel.html(my_html);

        // hook events on node row mouseover

        $('.node_row').on("mouseover", function(d,i){
            var node_sequence = $(this).attr("sequence");


            self.select_nodes_with_sequence(node_sequence);
//            self.select_links_with_sequence(node_sequence);
        });

        $('.node_row').on("mouseout", function(d,i){

            self.reset_selected_nodes();

//            self.reset_nodes();
//            self.reset_links();

        });

        // Capture checkbox click
        // http://stackoverflow.com/questions/1767246/javascript-check-if-string-begins-with-something



        $('.sequence_check').click(function() {
            var $this = $(this);
            // $this will contain a reference to the checkbox

            var sequence = d3.select(this.parentNode.parentNode).attr("sequence");

            // Activate all nodes

            self.unhide_all_sequences();

            // Update deactivated

            if ($this.is(':checked')) {
                // the checkbox was checked

                delete self.deactivated[sequence];


            } else {
                // the checkbox was unchecked

                 self.deactivated[sequence] = true;

            }

            // And deactivate in sorted order (from shorter to longest)

            var deactivated_keys = Object.keys(self.deactivated).sort(function(a,b){return a.length- b.length;});

            $.each(deactivated_keys, function(i,d){
                self.deselect_a_sequence(d);
            });
        });


        // TODO: Hook checkbox events...

    };

    self.render = function (file_path) {

        d3.json(file_path, function (error, json) {
            if (error) throw error;

              var nodes = self.tree.nodes(json),
                  links = self.tree.links(nodes);


              var min_size = d3.min(nodes, function(d,i){return d.size;});
              var max_size = d3.max(nodes, function(d,i){return d.size;});

              self.max_size = max_size;

              var opacity_scale = d3.scale.sqrt().domain([min_size,max_size]).range([1.0,1.0]).clamp(true);
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
                  .attr("opacity", function(d,i){return opacity_scale(d.size);})
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
                  .text(function(d) { return "q=" + ((d.size / self.max_size)*100).toFixed(2) + "%"; });



            // Fill node table


            self.set_node_table(nodes);


        });


    };

    // Object's main

    self.init();

    return self;
};

