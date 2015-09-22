var ccviz = ccviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


ccviz.viz.series_users = function(options)
{

    // Object

    var self = {};
    // Get options data

    for (key in options){
        self[key] = options[key];
    }

    self.parent_select = "#"+self.id_name;

    self.init = function(){

        // svg init

        console.log("Initializing series_users... en ");
        console.log(self.parent_select);
        self.svg = d3.select(self.parent_select).append("svg")
            .attr("width",self.width)
            .attr("height",self.height)
            .append("g");

        // warning message

        self.warningMessage = self.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("class","chordChartTextWarning")
            .attr("x", self.width/2)
            .attr("y", self.height/2)
            .text(self.loading_message);


    };

    self.render = function(data)
    {

        console.log("Rendering in series viz");
        console.log(data);

        self.warningMessage.transition().duration(self.trans_time).style("opacity",0.0).remove();
    };

    // Object's 'main'

    self.init();

    return self;

};
