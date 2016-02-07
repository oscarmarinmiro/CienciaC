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


    self.get_conditions = function(key){
        var conditions = {'game':{'ser':parseInt(key,10)}};

        // Get filter values

        console.log("GETTING FILTERS");
        $.each($(".filters"), function(i,d){
            var id = $(d).attr("id");
            var type = $(d).attr("type");
            var value = $(d).val();

            if(value!="all"){
                if(!(type in conditions)){
                    conditions[type] = {};
                }
                conditions[type][id] = value;
            }

        });

        console.log("FINAL CONDITIONS");

        return conditions;
    };

    self.fill_combo_fields_user = function(user_combo_fields, reverse_user_combo_fields, my_data){

        $.each(my_data.users, function(i,d){
            $.each(d, function (key,value){
                if((key in reverse_user_combo_fields) && (!(value in user_combo_fields[reverse_user_combo_fields[key]]))){
                    user_combo_fields[reverse_user_combo_fields[key]][value] = true;
                }
            });
        });

    };

    self.fill_combo_fields_game = function(game_combo_fields, reverse_game_combo_fields,my_data){

        $.each(my_data.users, function(i,d){
            $.each(d.gam, function (i,d){
                $.each(d, function (key,value) {
                    if((key in reverse_game_combo_fields) && (!(value in game_combo_fields[reverse_game_combo_fields[key]]))){
                        game_combo_fields[reverse_game_combo_fields[key]][value] = true;
                    }
                });
            });
        });

    };

    self.get_url_params = function(){

        self.url = Qurl.create();

        self.url_params = self.url.query();

    };

    self.set_url_param = function(param, value){
        self.url.query(param, value);
    };

    self.set_url_params = function(conditions, variable, variable_name, method){

        // First, delete all posible params in url

        $.each(self.url.query(), function(key,value){
            self.delete_url_param(key);
        });

        if('game' in conditions){
            $.each(['exp'], function(i,d){
                if(d in conditions['game']){
                    self.set_url_param("game."+d, conditions['game'][d]);
                }
            });
        }

        if('user' in conditions){
            $.each(['agr','ed', 'gen'], function(i,d){
                if(d in conditions['user']){
                    self.set_url_param("user."+d, conditions['user'][d]);
                }
            });
        }

        self.set_url_param("var", variable);
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

        var series_select_text = '<div class="left">Select variable</div><select class="left" id="variable_dropdown"></select>';

        series_select_text+= '<div class="left" >Select display method</div><select class="left" id="method_dropdown"></select>';

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

                // serie, experiment

                // Populate series filter


                var series_list = [];

                $.each(my_data.series, function (key,value){
                    //http://stackoverflow.com/questions/815103/jquery-best-practice-to-populate-drop-down
                    series_list.push(parseInt(key,10));
                });

                var series_min = d3.min(series_list);
                var series_max = d3.max(series_list);

                console.log("SERIES MIN");
                console.log(series_min);

                console.log("SERIES MAX");
                console.log(series_max);


                // Populate variable filter

                var variables_dict = [[2, 'decision'], [1,'elapsed time'], [3,'error']];

                var variables = $("#variable_dropdown");

                $.each(variables_dict, function (i,value){
                    if('var' in self.url_params && parseInt(self.url_params['var'],10) === value[0]) {
                        variables.append($("<option />").val(value[0]).text(value[1]).attr("selected", true));
                    }
                    else {
                        //http://stackoverflow.com/questions/815103/jquery-best-practice-to-populate-drop-down
                        variables.append($("<option />").val(value[0]).text(value[1]));
                    }

                });

                variables.change(function(){
                    self.variable = $(this).val();
                    self.variable_name = $(this).children("option").filter(":selected").text();
                    self.render_s();
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


                // Populate user field filter

                var user_combo_fields = {'education_level':{},
                                        'age_range':{},
                                        'gender':{}
                };

                var reverse_user_combo_fields = {'ed': 'education_level',
                                                 'agr': 'age_range',
                                                 'gen': 'gender'};

                var direct_user_combo_fields = {'education_level': 'ed' ,
                                                 'age_range': 'agr',
                                                 'gender': 'gen'};


                self.fill_combo_fields_user(user_combo_fields, reverse_user_combo_fields, my_data);

                var game_combo_fields = {'experiment':{}};

                var reverse_game_combo_fields = {'exp': 'experiment'};

                var direct_game_combo_fields = {'experiment': 'exp'};

                self.fill_combo_fields_game(game_combo_fields, reverse_game_combo_fields, my_data);


                console.log("COMBO FIELDS CONTENTS");
                console.log(user_combo_fields);



                $.each(user_combo_fields, function(key,value){
                    d3.select("#series_select").append("div").attr("class", "left").html(key.charAt(0).toUpperCase() + key.replace("_", " ").slice(1));
                    d3.select("#series_select").append("select").attr("id",direct_user_combo_fields[key]).attr("type","user").attr("class","filters");

                    var id = direct_user_combo_fields[key];

                    $("#"+id).append($("<option />").val("all").text("All"));

                    $.each(Object.keys(value).sort(), function(i,d){
                        if ('user.' + id in self.url_params && self.url_params['user.' + id] === d){
                            $("#" + id).append($("<option />").val(d).text(human_translations[key][d]).attr("selected", true));
                        }else {
                            $("#" + id).append($("<option />").val(d).text(human_translations[key][d]));
                        }
                    });
                });

                $.each(game_combo_fields, function(key,value){
                    d3.select("#series_select").append("div").attr("class", "left").html(key.charAt(0).toUpperCase() + key.replace("_", " ").slice(1));
                    d3.select("#series_select").append("select").attr("id",direct_game_combo_fields[key]).attr("type","game").attr("class","filters");

                    var id = direct_game_combo_fields[key];

                    $("#"+id).append($("<option />").val("all").text("All"));

                    $.each(value, function(key, value){
                        if ('game.' + id in self.url_params && self.url_params['game.' + id] === key) {
                            $("#" + id).append($("<option />").val(key).text(key).attr("selected", true));
                        }else{
                            $("#" + id).append($("<option />").val(key).text(key));
                        }
                    });

                });

                $(".filters").change(function(){
                    self.render_s();
                });

                self.render_s = function() {

                    self.set_url_params(self.get_conditions(key), self.variable, self.variable_name, self.method);


                    for (var i = series_min; i < series_max + 1; i++) {
                        $("#viz_" + i).remove();
                        d3.selectAll("#zona_viz").append("div").attr("id", "viz_" + i).style("float", "left");
                        d3.selectAll("#viz_" + i).append("div").attr("id", "time_series_" + i);
                        d3.selectAll("#viz_" + i).append("div").attr("id", "users_series_" + i);

                        self.series_chart = ccviz.viz.series_users(
                            {
                                'id_time': "time_series_" + i,
                                'id_users': "users_series_" + i,
                                'width': 300,
                                'height': 200,
                                'trans_time': self.trans_time,
                                'loading_message': "Loading data...",
                                'up_color': "#4C4",
                                'down_color': "#C44",
                                'infos': self.infos,
                                'data': my_data
                            });

                        self.series_chart.render(self.get_conditions(i), self.variable, self.method);
                    }
                };

                console.log("VARIABLES");
                console.log(variables);

                variables.trigger("change");


            }
            else
            {
                console.log("Could not load file: "+self.base_data + self.data_file);
            }
        });

    });
};
