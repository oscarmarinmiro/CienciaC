var ccviz = ccviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };

ccviz.viz.expandableTree = function(options) {

    var self = {};


    // Get options data

    for (key in options){
        self[key] = options[key];
    }

    self.up_color = "#933";
    self.down_color = "#393";

    console.log("OPTIONS");

    console.log(self);

    var _mousemove = function () {
        self.tooltip
                .style("left", (d3.event.pageX + 20) + "px")
                .style("top", (d3.event.pageY - 12) + "px");
    };

    function get_info_from_node(d) {
        console.log(d);
        if (d.name.toLowerCase() != '__end__') {
            return '"' + d.name.toLowerCase() + '"' + "</br>" + d.absolute + " occurrences" + "</br>" + d.percentage.toFixed(2) + " %";
        }
        else {
            return 'Terminal node' + "</br>" + d.absolute + " items" + "</br>" + d.percentage.toFixed(2) + " %";
        }
    }

    function get_size_per_level(d) {


        if ('parent' in d) {
            var parent = d.parent;

            if ('children' in parent) {

                var children = parent.children;

                var total = 0;

                for (var i = 0; i < children.length; i++) {

                    total += children[i].size;
                }

                d.absolute = (d.size);
                d.percentage = (d.size / total) * 100;

                return (d.size / total);
            }
            else {
                d.absolute = (d.size);
                d.percentage = 100;

                return 1;
            }

        }
        else {
            d.absolute = (d.size);
            d.percentage = 100;

            return 1;
        }
    }

    //    REFERENCES
    /*http://javascript.tutorialhorizon.com/2014/09/15/render-a-d3-tree-with-a-minimum-distance-between-the-tree-nodes/*/

    self.init = function() {

        var i = 0,
                duration = 750,
                root;

        self.i = i;
        self.duration = duration;
        self.root = root;

//        // Variables used to hold marked links in the tree, after a path search
//
//        self.marked_links = [];

        self.FROM_CIRCLE_TO_QUAD_AREA = Math.sqrt(Math.PI / 4);

        console.log("CIRCLE CONSTANT");
        console.log(self.FROM_CIRCLE_TO_QUAD_AREA);

        var width = (window.innerWidth * self.horizontal_span),
                height = (window.innerHeight * self.vertical_span);

        var tree = d3.layout.tree()
                .size([height - 40, width]);

        tree.sort(function (a, b) {
            return b.size - a.size;
        });

        self.tree = tree;

        self.diagonal = d3.svg.diagonal()
                .projection(function (d) {
                    return [d.y, d.x];
                });

        self.svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("id", "svg_tree")
                .append("g")
                .attr("transform", "translate(100,20)").on("mousemove", _mousemove);


        self.tooltip = d3.select("body").append("div")
                .attr("id", "tooltip")
                .html("")
                .attr("class", "tooltip")
                .style("opacity", 0);

        self.height = height;
        self.width = width;

    };



    self.render = function (file_path) {

        d3.json(file_path, function (error, json) {
            if (error) throw error;

            self.original_data = $.extend(true, {}, json);
            console.log("ORIGINAL_DATA");
            console.log(self.original_data);



            self.root = json;
            self.root.x0 = (self.height - 40) / 2;
            self.root.y0 = 0;

            function collapse(d) {
                if (d.children) {
                    d._children = d.children;
                    d._children.forEach(collapse);
                    d.children = null;
                }
            }

            self.root.children.forEach(collapse);
            self.update(self.root);

        });

        d3.select(self.frameElement).style("height", self.height + "px");

        self.update = function(source) {

            var radius_scale = d3.scale.sqrt().domain([0, 1]).range([3, 10]).clamp(true);
            var stroke_scale = d3.scale.linear().domain([0, 1]).range([0.5, 10.0]).clamp(true);

            // Compute the new tree layout.
            var nodes = self.tree.nodes(self.root).reverse(),
                    links = self.tree.links(nodes);

            // Normalize for fixed-depth.
            nodes.forEach(function (d) {
                d.y = d.depth * self.horizontal_jump;
            });

            // Update the nodes…
            var node = self.svg.selectAll("g.node")
                    .data(nodes, function (d) {
                        return d.id || (d.id = ++self.i);
                    });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                    .attr("transform", function (d) {
                        return "translate(" + source.y0 + "," + source.x0 + ")";
                    })
                    .on("click", function(d,i){ self.svg.selectAll("circle").classed("marked", false); self.click(d);});

            nodeEnter.filter(function (d) {
                return d.name !== "__END__"
            }).append("circle")
                    .attr("r", 1e-6)
                    .style("fill", function (d) {
                        return d._children ? "lightsteelblue" : "#fff";
                    })
                    .on("mouseover", function (d, i) {
                        self.tooltip.style("opacity", 1.0);
                        self.tooltip.html(get_info_from_node(d));
                    })
                    .on("mouseout", function (d, i) {
                        self.tooltip.style("opacity", 0.0);
                    });

            nodeEnter.filter(function (d) {
                return d.name === "__END__"
            }).append("rect")
                    .attr("width", 0)
                    .attr("height", 0)
                    .attr("x", 0)
                    .attr("y", 0)
                    .style("fill", function (d) {
                        return d._children ? "lightsteelblue" : "#fff";
                    })
                    .on("mouseover", function (d, i) {
                        self.tooltip.style("opacity", 1.0);
                        self.tooltip.html(get_info_from_node(d));
                    })
                    .on("mouseout", function (d, i) {
                        self.tooltip.style("opacity", 0.0);
                    });


            nodeEnter.filter(function (d) {
                return d.name !== "__END__"
            }).append("text")
                    .attr("x", function (d) {
                        return d.children || d._children ? -10 : 10;
                    })
                    .attr("dy", ".35em")
                    .attr("text-anchor", function (d) {
                        return d.children || d._children ? "end" : "start";
                    })
                    .text(function (d) {
                        if(d.name=="1"){return "UP";}
                        if(d.name=="-1"){return "DOWN";}
                        return d.name;
                    })
                    .style("fill",function(d){
                        if(d.name=="1"){return self.up_color;}
                        if(d.name=="-1"){return self.down_color;}
                        return "black";

                    })
                    .style("fill-opacity", 1e-6);

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                    .duration(self.duration)
                    .attr("transform", function (d) {
                        return "translate(" + d.y + "," + d.x + ")";
                    });

            nodeUpdate.select("circle")
                    .attr("r", function (d, i) {
                        return radius_scale(get_size_per_level(d));
                    })
                    .style("fill", function (d) {
                        return d._children ? "lightsteelblue" : "#fff";
                    });

            nodeUpdate.select("rect")
                    .attr("width", function (d, i) {
                        return radius_scale(get_size_per_level(d)) * 2 * self.FROM_CIRCLE_TO_QUAD_AREA;
                    })
                    .attr("height", function (d, i) {
                        return radius_scale(get_size_per_level(d)) * 2 * self.FROM_CIRCLE_TO_QUAD_AREA;
                    })
                    .attr("x", function (d, i) {
                        return -radius_scale(get_size_per_level(d)) * self.FROM_CIRCLE_TO_QUAD_AREA;
                    })
                    .attr("y", function (d, i) {
                        return -radius_scale(get_size_per_level(d)) * self.FROM_CIRCLE_TO_QUAD_AREA;
                    })
                    .style("fill", function (d) {
                        return d._children ? "lightsteelblue" : "#fff";
                    });

            nodeUpdate.select("text")
                    .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                    .duration(self.duration)
                    .attr("transform", function (d) {
                        return "translate(" + source.y + "," + source.x + ")";
                    })
                    .remove();

            nodeExit.select("circle")
                    .attr("r", 1e-6);

            nodeExit.select("text")
                    .style("fill-opacity", 1e-6);

            // Update the links…
            var link = self.svg.selectAll("path.link")
                    .data(links, function (d) {
                        return d.target.id;
                    });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                    .attr("class", "link")
                    .attr("d", function (d) {
                        var o = {x: source.x0, y: source.y0};
                        return self.diagonal({source: o, target: o});
                    });

            // Transition links to their new position.
            link.transition()
                    .duration(self.duration)
                    .attr("d", self.diagonal)
                    .style("stroke-width", function (d, i) {
                        return stroke_scale(get_size_per_level(d.target));
                    });

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                    .duration(self.duration)
                    .attr("d", function (d) {
                        var o = {x: source.x, y: source.y};
                        return self.diagonal({source: o, target: o});
                    })
                    .remove();

            // Stash the old positions for transition.
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        };

        // Toggle children on click.
        self.click = function(d) {
            console.log("CLICKING NODE");
            console.log(d);
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            self.update(d);
        };

    };

    // Object's main

    self.init();

    return self;
};
