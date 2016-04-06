var ccviz = ccviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };

ccviz.viz.circularTree = function(options) {

    var self = {};


    // Get options data

    for (key in options){
        self[key] = options[key];
    }

    // Object to store deactivated sequences

    self.deactivated = {};


    self.init = function() {

        self.diameter = self.diameter - self.chart_margin;


        var _mousemove = function () {
            self.tooltip
                    .style("left", (d3.event.pageX + 20) + "px")
                    .style("top", (d3.event.pageY - 12) + "px");
        };


        self.tree = d3.layout.tree()
            // 360degrees + radius
            .size([360, self.diameter / 2 - 40])
            .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

        self.diagonal = d3.svg.diagonal.radial()
            .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

        self.svg = d3.select("#viz_frame").append("svg")
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

    self.get_url_params = function(){

        self.url = Qurl.create();

        self.url_params = self.url.query();

    };

    self.set_url_param = function(param, value){
        self.url.query(param, value);
    };

    self.set_url_params = function(conditions, variable, variable_name, method){

//            self.delete_url_param(key);
//                    self.set_url_param("game."+d, conditions['game'][d]);
    };


    self.delete_url_param = function(param){
        self.url.query(param, false);
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

//    self.is_first_descendent_hidden = function(sequence){
//
//        d3.selectAll(".node").filter(function(d,i){
//
//            var node_sequence = self.get_sequence_from_node(d);
//
//            // Node goes through clicked node
//
//            return node_sequence === (sequence + "UP");
//
//        }).classed("selected_hidden", false);
//
//    };

    self.deselect_all_links_to_node = function(d){

        d3.selectAll(".link").filter(function(link,i){
            return link.target === d;
        }).classed("hidden_link", true);
    };

    self.select_all_links_from_node_parent = function(d){

        console.log("NODE");
        console.log(d);

        d3.selectAll(".link").filter(function(link,i){
            return link.source === d.parent;
        }).classed("hidden_link", false);

    };

    self.select_inmediate_descendents = function(sequence, levels){

        d3.selectAll(".node").filter(function(d,i){

            var node_sequence = self.get_sequence_from_node(d);

            // Node goes through clicked node

            if((node_sequence == sequence + "/UP") || (node_sequence == sequence + "/DOWN")){

                self.select_all_links_from_node_parent(d);

                d3.select(this).select(".expansion").text("+");

                return true;

            }
            else{
                return false;
            }

        }).classed("selected_hidden", false).classed("clicked", false);

    };


    self.select_a_sequence = function(sequence, levels){

        d3.selectAll(".node").filter(function(d,i){

            return self.get_sequence_from_node(d) === sequence;

        }).classed("selected_hidden", false);

    };


    self.deselect_a_sequence = function(sequence, level_up){

        d3.selectAll(".node").filter(function(d,i){

            // Only childs, i.e: not deselect same node

            if((self.get_sequence_from_node(d).indexOf(sequence)==0) && (self.get_sequence_from_node(d)!= sequence)) {

                self.deselect_all_links_to_node(d);
                return true;
            }
            else{
                return false;
            }

        }).classed("selected_hidden", true);

    };

    self.unhide_all_sequences = function(){

        d3.selectAll(".node").classed("selected_hidden", false);

    };

    self.hide_all_sequences = function(){
        d3.selectAll(".node").classed("selected_hidden", true);
        d3.selectAll(".link").classed("hidden_link", true);
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

    self.refresh_from_clicked_param = function(){

        self.clicked_nodes = {};

        var clicked_from_param = self.url_params['active'].split(".");

        $.each(clicked_from_param, function(i,d){

            var id = parseInt(d, 10);

            self.clicked_nodes[id] = true;

        });

        d3.selectAll(".node").each(function(d,i){

            if(i in self.clicked_nodes){
                self.select_inmediate_descendents(self.get_sequence_from_node(d));
                d3.select(this).classed("clicked", true);
                d3.select(this).select(".expansion").text("-");
            }
        });

    };

    self.refresh_clicked_param = function(){

        d3.selectAll(".node").each(function(d,i){

            // If visible and clicked...

            if(d3.select(this).classed("clicked") && d3.select(this).classed("selected_hidden") === false){
                self.clicked_nodes[i] = true;
            }
            else{
                delete(self.clicked_nodes[i]);
            }

        });

        self.set_url_param("active", Object.keys(self.clicked_nodes).join("."));

    };


    self.render = function (file_path) {

        // Initialize Qurl object

        self.get_url_params();

        d3.json(file_path, function (error, json) {
            if (error) throw error;

              var nodes = self.tree.nodes(json),
                  links = self.tree.links(nodes);


              self.clicked_nodes = {};


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
                })
                .on("click", function (d,i){
                    if(d3.select(this).classed("clicked")){
                        self.deselect_a_sequence(self.get_sequence_from_node(d));
                        d3.select(this).classed("clicked", false);
                        d3.select(this).select(".expansion").text("+");
                    }
                    else{
                        self.select_inmediate_descendents(self.get_sequence_from_node(d));
                        d3.select(this).classed("clicked", true);
                        d3.select(this).select(".expansion").text("-");
                    }

                    self.refresh_clicked_param();
                });


            node.append("image")
                .attr("class", "minus")
                .attr("x", "-10")
                .attr("y", "-10")
                .attr("width", "20px")
                .attr("height", "20px")
                .attr("xlink:href", function(d,i){return d.name=="-1" ? "img/arrow_down.png": "img/arrow_up.png";});

              node.filter(function(d,i){return d.depth < self.max_depth;}).append("circle")
                  .attr("class", "expansion_circle")
                  .attr("cx", function(d) { return d.x < 180 ? -20 : +20; })
                  .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
                  .attr("cy", 0)
                  .attr("r", 5);

              node.filter(function(d,i){return d.depth < self.max_depth;}).append("text")
                  .attr("class", "expansion")
                  .attr("dy", ".31em")
                      .attr("x", function(d) { return d.x < 180 ? -22.5 : +22.5; })
                  .attr("y", 0)
                  .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
                  .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
                  .text("+");


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


              self.hide_all_sequences();

              self.select_a_sequence("UP");

              self.select_a_sequence("DOWN");

              d3.selectAll(".node").classed("clicked", false);

              self.refresh_from_clicked_param();

//              self.refresh_clicked_param();






//              self.select_inmediate_descendents("UP");
//
//              self.select_inmediate_descendents("DOWN");


//              self.deselect_a_sequence("DOWN/DOWN");
//              self.deselect_a_sequence("DOWN/UP");



        });


    };

    // Object's main

    self.init();

    return self;
};

