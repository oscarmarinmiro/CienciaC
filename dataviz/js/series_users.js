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


    // Document ready...

    $(document).ready(function()
    {

        var series_select_text = '<div>Select series</div><select id="series_dropdown"></select>' +
            '<div>Select variable</div><select id="variable_dropdown"></select>';

        var inject_string =
            [   '<div id="zona_opciones" class="zona_opciones"><div id="series_select">'+ series_select_text + '</div></div>',
                '<div id="zona_info" class="zona_info"></div>',
                '<div id="zona_viz" class="zona_viz"><div id="time_series"></div><div id="users_series"></div></div>'
            ].join('\n');


        $(self.parent_select).html(inject_string);

        // Scale info

        self.infos = {
            3: { range: ["#fc8d59","#91cf60"]},
            2: { range: ["#fc8d59","#91cf60"]},
            1: { range: ["#91cf60", "#fc8d59"]}

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


                var series = $("#series_dropdown");

                $.each(my_data.series, function (key,value){
                    //http://stackoverflow.com/questions/815103/jquery-best-practice-to-populate-drop-down
                    series.append($("<option />").val(key).text("Serie "+key));
                });

                // Populate variable filter

                var variables_dict = {1: 'elapsed time', 2: 'decision', 3: 'error'};

                var variables = $("#variable_dropdown");

                $.each(variables_dict, function (key,value){
                    //http://stackoverflow.com/questions/815103/jquery-best-practice-to-populate-drop-down
                    variables.append($("<option />").val(key).text(value));
                });

                variables.change(function(){
                    self.variable = $(this).val();
                    series.trigger("change");
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

                self.fill_combo_fields_game(game_combo_fields, reverse_game_combo_fields, my_data);


                $.each(user_combo_fields, function(key,value){
                    d3.select("#series_select").append("div").html(key.charAt(0).toUpperCase() + key.replace("_", " ").slice(1));
                    d3.select("#series_select").append("select").attr("id",direct_user_combo_fields[key]).attr("type","user").attr("class","filters");

                    var id = direct_user_combo_fields[key];

                    $("#"+id).append($("<option />").val("all").text("All"));

                    $.each(value, function(key, value){
                        $("#"+id).append($("<option />").val(key).text(key));
                    });
                });

                $.each(game_combo_fields, function(key,value){
                    d3.select("#series_select").append("div").html(key.charAt(0).toUpperCase() + key.replace("_", " ").slice(1));
                    d3.select("#series_select").append("select").attr("id",key).attr("type","game").attr("class","filters");

                    var id = key;

                    $("#"+id).append($("<option />").val("all").text("All"));

                    $.each(value, function(key, value){
                        $("#"+id).append($("<option />").val(key).text(key));
                    });

                });

                $(".filters").change(function(){
                    series.trigger("change");
                });

                series.change(function()
                {
                    var key = $(this).val();
                    console.log("COMBO CHANGED");

                    $("#time_series").remove();
                    $("#users_series").remove();
                    $("#tooltip").remove();

                    d3.selectAll("#zona_viz").append("div").attr("id","time_series");
                    d3.selectAll("#zona_viz").append("div").attr("id","users_series");

                    // Series diagram instantiation

                    self.series_chart = ccviz.viz.series_users(
                        {
                            'id_time': "time_series",
                            'id_users': "users_series",
                            'width': $("#zona_viz").width(),
                            'height':$( document ).height(),
                            'trans_time': self.trans_time,
                            'loading_message':"Loading data...",
                            'up_color': "#4C4",
                            'down_color': "#C44",
                            'infos': self.infos,
                            'data': my_data
                        });

                    self.series_chart.render(self.get_conditions(key), self.variable);

                });

                variables.trigger("change");

                series.trigger("change");


            }
            else
            {
                console.log("Could not load file: "+self.base_data + self.data_file);
            }
        });

    });
};
