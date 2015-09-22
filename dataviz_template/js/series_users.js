var ccviz = ccviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


ccviz.controller.series_users = function(options)
{
    // Self object

    var self = {};


    // self properties from options object

    for (key in options){
        self[key] = options[key];
    }

    self.parent_select = "#"+self.id_name;



    // Document ready...

    $(document).ready(function()
    {

        // Inject html on parent div

        var inject_string =
            [   '<div id="zona_opciones" class="zona_opciones"></div>',
                '<div id="zona_info" class="zona_info"></div>',
                '<div id="zona_viz" class="zona_viz"></div>'
            ].join('\n');


        $(self.parent_select).html(inject_string);

        // Color scale

        self.color_scale = d3.scale.category20();

        // Chord Diagram instantiation

        self.series_chart = ccviz.viz.series_users(
            {
                'id_name':"zona_viz",
                'width': $("#zona_viz").width(),
                'height':$( document ).height(),
                'trans_time': self.trans_time,
                'loading_message':"Loading data...",
                'color_scale': self.color_scale
            });

        // Get data file and store properties in self

        d3.json(self.base_data+self.data_file, function(my_data)
        {
            if(my_data!=null)
            {
                console.log("Recibido data en controller...");
                console.log(my_data);

                // do something with data
                self.series_chart.render(my_data);

            }
            else
            {
                console.log("Could not load file: "+self.base_data + self.data_file);
            }
        });

    });
};
