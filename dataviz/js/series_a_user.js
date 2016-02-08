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


    self.get_url_params = function(){

        self.url = Qurl.create();

        self.url_params = self.url.query();

    };

    self.set_url_param = function(param, value){
        self.url.query(param, value);
    };

    self.set_url_params = function(user_id, method){

        // First, delete all posible params in url

        $.each(self.url.query(), function(key,value){
            self.delete_url_param(key);
        });


        self.set_url_param("user_id", user_id);
        self.set_url_param("met", method);
    };


    self.delete_url_param = function(param){
        self.url.query(param, false);
    };


    // Document ready...

    $(document).ready(function()
    {
        // Get url params

        self.get_url_params();

        var series_select_text = '<div class="left">Select user</div><select class="left" id="users_dropdown"></select>';

//        series_select_text+= '<div class="left" >Select display method</div><select class="left" id="method_dropdown"></select>';

        var inject_string =
            [   '<div id="zona_opciones" class="zona_opciones"><div id="series_select">'+ series_select_text + '</div></div>',
                '<div id="zona_info" class="zona_info"></div>',
                '<div id="zona_viz" class="zona_viz"></div>'
            ].join('\n');


        $(self.parent_select).html(inject_string);

        // Scale info

        self.infos = {
            3: { range: ["#fc8d59","#ffffbf","#91cf60"]},
            2: { range: ["#fc8d59","#ffffbf","#91cf60"]},
            1: { range: ["#91cf60","#ffffbf","#fc8d59"]}

        };

        // Get data file and store properties in self

        d3.json(self.base_data+self.data_file, function(my_data)
        {
            if(my_data!=null)
            {
                console.log("Recibido data en controller...");
                console.log(my_data);

                var user_list = my_data.users.map(function(d){return d.id});

                // Choose a random user if not user by param...

                if(user_list.indexOf(parseInt(self.url_params['user_id'],10))===-1){
                    // Sets a random user and sets param + refresh gets params

                    self.user_id = user_list[Math.floor((Math.random() * user_list.length))]
                    self.set_url_param('user_id', self.user_id);
                    self.get_url_params();

                }
                else{
                    self.user_id = parseInt(self.url_params['user_id'],10);
                }


                console.log("USER LIST");
                console.log(user_list);

                var users = $("#users_dropdown");

                $.each(my_data.users, function (i,d){
                    if(self.user_id === d.id){
                        users.append($("<option />").val(d.id).text(d.nam).attr("selected", true));
                    }
                    else {
                        //http://stackoverflow.com/questions/815103/jquery-best-practice-to-populate-drop-down
                        users.append($("<option />").val(d.id).text(d.nam));
                    }
                });


                // Populate method filter

                var method_dict = {1: 'average', 2: 'standard deviation'};

                // Hardcode initial method

                self.method = method_dict['1'];

                var method = $("#method_dropdown");

                $.each(method_dict, function (key, value){
                    if('met' in self.url_params && self.url_params['met'] === value) {
                        method.append($("<option/>").val(key).text(value).attr("selected", true));
                        self.method = method_dict[key];

                    }else {
                        method.append($("<option/>").val(key).text(value));
                    }
                });

                method.change(function(){
                    self.method = method_dict[$(this).val()];
                    self.render_s();
                });

                users.change(function(){
                    self.user_id = parseInt($(this).val(),10);
                    self.render_s();
                });

                // 'render_s' is for 'render_series'

                self.render_s = function() {

                    self.set_url_params(self.user_id, self.method);

                    // Find the user in all data...

                    var my_user_data = null;
                    var my_user_market_series = {};

                    $.each(my_data.users, function (i, d) {
                        if (d.id == self.user_id) {
                            my_user_data = d;
                        }
                    });

                    $.each(my_user_data.gam, function (i, d) {
                        my_user_market_series[d.ser] = my_data.series[d.ser];
                    });

                    // Delete all divs before rendering anything

                    $(".a_user_series").remove();

                    // If there are games for this user

                    if (my_user_data.gam.length != 0) {

                        // First remove 'no data' warning

                        d3.selectAll(".no_series_data").remove();

                        $.each(my_user_data.gam, function (i, d) {

                            d3.selectAll("#zona_viz").append("div").attr("id", "viz_" + i).classed("a_user_series", true).style("float", "left");
                            d3.selectAll("#viz_" + i).append("div").attr("id", "time_series_" + i);
                            d3.selectAll("#viz_" + i).append("div").attr("id", "users_series_" + i);

                            self.series_chart = ccviz.viz.series_users(
                                {
                                    'id_time': "time_series_" + i,
                                    'id_users': "users_series_" + i,
                                    'width': 600,
                                    'height': 300,
                                    'trans_time': self.trans_time,
                                    'loading_message': "Loading data...",
                                    'up_color': "#4C4",
                                    'down_color': "#C44",
                                    'infos': self.infos,
                                    'user_data': my_user_data,
                                    'user_series_data': d,
                                    'series_data': my_user_market_series[d.ser]
                                });

                            self.series_chart.render(self.method);


                        });
                    }
                    else {
                        d3.selectAll("#zona_viz").append("div").classed("no_series_data", true).html("No data for selected user");
                    }
                };

                // Trigger a change for first render
                users.trigger("change");


            }
            else
            {
                console.log("Could not load file: "+self.base_data + self.data_file);
            }
        });

    });
};
