var ccviz = ccviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


ccviz.viz.series_users = function(options)
{

    // Object

    var self = {};

    // Get options data

    for (key in options){
        self[key] = options[key];
    }


    // Constants

    self.TIME_SERIES_HEIGHT_FACTOR = 0.30;
    self.ARROW_OFFSET = 20;
    self.LEFT_MARGIN = 250;
    self.RIGHT_MARGIN = 100;
    self.MIN_SERIES_INDEX = 1;
    self.MAX_SERIES_INDEX = 25;
    self.MIN_USER_SERIES_INDEX = 1;
    self.MAX_USER_SERIES_INDEX = 25;
    self.CIRCLE_RADIUS = 5;
    self.TITLE_OFFSET = 40;

    self.VERTICAL_TILES_PAGE = 30.0;

    self.parent_select = "#"+self.id_users;
    self.time_parent_select = "#" + self.id_time;

    self.pseudo_height = self.height- $("#zona_viz").offset().top;

    self.VOID_COLOR = "#FFF";

    var _mousemove = function () {
        self.tooltip
                .style("right", self.width-(d3.event.pageX ) + 20 + "px")
                .style("top", (d3.event.pageY) + "px");
    };

    self.init = function(){

        // svg init

        console.log("Initializing series_users... en ");
        console.log(self.parent_select);

        self.svg = d3.select(self.parent_select).append("svg")
            .attr("width",self.width)
            .attr("height",100000)
            .append("g").on("mousemove", _mousemove);

        $("#users_series").css("height", self.pseudo_height);

        console.log("Initializing series_time... en ");
        console.log(self.time_parent_select);

        self.time_svg = d3.select(self.time_parent_select).append("svg")
            .attr("width",self.width)
            .attr("height",self.pseudo_height*(self.TIME_SERIES_HEIGHT_FACTOR))
            .append("g").on("mousemove", _mousemove);

        // Separate svg div for scales for avoiding scroll problems with matrix svg

//        d3.select("#scales_div").style("left","100px").style("top","100px");
//
//        self.scale_svg = d3.select("#scales_div").append("svg");

        self.tooltip = d3.select("body").append("div")
                .attr("id", "tooltip")
                .html("")
                .attr("class", "tooltip")
                .style("opacity", 0);

        // warning message

        self.warningMessage = self.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("class","textWarning")
            .attr("x", (self.LEFT_MARGIN + (self.width-self.RIGHT_MARGIN))/2)
            .attr("y", (self.pseudo_height * (1 - self.TIME_SERIES_HEIGHT_FACTOR))/2)
            .text(self.loading_message);


        self.prepare_series_data();

    };

    self.prepare_series_data = function(){

        self.series = {};

        for (var number in self.data['series'])
        {
            var my_data = self.data['series'][number];
            self.series[number] = {};

            self.series[number]['name'] = my_data.idx;
            self.series[number]['series'] = [];

            for(var i=self.MIN_SERIES_INDEX; i< self.MAX_SERIES_INDEX+1; i++){
                self.series[number]['series'].push({
                    'date': self.data.series[number]['rnd'][i.toString(10)]['date'],
                    'price': self.data.series[number]['rnd'][i.toString(10)]['price'],
                    'result': self.data.series[number]['rnd'][i.toString(10)]['result']});
            }

        }


//         console.log(self.series);

    };

    self.check_filters = function(user_data, game_data, conditions){

        var user_ok = true;
        var game_ok = true;

        for(var condition in conditions.user){
            if (user_data[condition]!= conditions.user[condition]){
                user_ok = false;
            }
        }

        for(var condition in conditions.game){
            if (game_data[condition]!= conditions.game[condition]){
                game_ok = false;
            }
        }

//        console.log("USER OK");
//        console.log(user_ok);
//        console.log("GAME OK");
//        console.log(game_ok);

        return (game_ok && user_ok)
    };

    self.prepare_users_data = function(conditions){

        console.log("PREPARE_USERS_DATA_WITH_CONDITIONS");
        console.log(conditions);

        var experiments = {};

        var rows  = [];

        for (var i in self.data['users'])
        {
            var user_data = $.extend(true, {}, self.data['users'][i]);
            delete user_data.gam;

            var my_user = self.data['users'][i];

            for(var j in my_user.gam)
            {
                var game = my_user.gam[j];

                var game_data = $.extend(true,{}, my_user.gam[j]);

                delete game_data.rnd;

                // If completed and filter pass and rnd[0] != undefined ==>

                if((game.com == 1) && (self.check_filters(user_data, game_data, conditions)))
                {
                    if (typeof(game.rnd[0]) != 'undefined')
                    {
                        var row = [];

                        var experiment = game.exp;

                        if(!(experiment in experiments)){
                            experiments[experiment] = 0;
                        }

                        experiments[experiment]+=1;

                        for (var k in game.rnd) {

                            var real_round = parseInt(k)+1;


                            if((real_round>= self.MIN_USER_SERIES_INDEX) && (real_round<=self.MAX_USER_SERIES_INDEX)) {
                                var round = game.rnd[k];

                                row.push({'user': user_data, 'round': round, 'game': game_data});
                            }

                        }

                        rows.push(row);
                    }
                }
            }

        }

//        console.log(experiments);
        console.log("PREPARING USER DATA");
        console.log("ROWS");
        console.log(rows);

        return rows;


    };

    self.get_color_from_data = function(d){

//        console.log("ROUND_DATA");
//        console.log(d);

//        if(d.round_data[self.data_field]==1){
//            return "#4C4";
//        }
//        else
//        {
//            return "#C44";
//        }
        if(d.row != 0) {
            if(d.round_data[self.data_field] === 0){
                return self.VOID_COLOR;
            }
            else{
                return self.color_scale(d.round_data[self.data_field]);
            }
        }
        else{
//            if(d.round_data[self.data_field] === 0){
//                return self.VOID_COLOR;
//            }
//            else{
                return self.avg_color_scale(d.round_data[self.data_field]);
//            }

        }

    };

    self.fill_info_box = function(data_name){

        var my_html = "";

        my_html+="You're seeing the <strong>" + data_name + " </strong> variable; ";

        my_html+= "<strong>" + data_name + " </strong>";

        if(data_name === "error"){
            my_html+=" is expressed as -1 in case of error guessing points and +1 in case of success.";
        }
        if(data_name === "elapsed time"){
            my_html+=" is the time elapsed between points in series, measured in seconds.";
        }
        if(data_name === "decision"){
            my_html+=" is expressed as +1 if the user decides that the point will go up, -1 if the user decides that the point will go up";
        }


        d3.select("#infobox").html(my_html);

    };


    // Build scale that corresponds to data_field, based in self.infos from controller

    self.build_color_scale = function(){
        var my_scale_info = self.infos[self.data_field];

        self.color_scale = d3.scale.linear().domain([self.data_min, (self.data_min+self.data_max)/2, self.data_max]).range([my_scale_info.range[0], my_scale_info.range[1], my_scale_info.range[2]]).clamp(true);
        self.avg_color_scale = d3.scale.linear().domain([self.avg_min, (self.avg_min+self.avg_max)/2, self.avg_max]).range([my_scale_info.range[0], my_scale_info.range[1], my_scale_info.range[2]]).clamp(true);

    };

    self.render_series = function(data)
    {
        console.log("DATA PARA RENDER_SERIES");
        console.log(data);

        // General tittle

        var title_text = "Serie " + self.series_number + " -  " + self.series[self.series_number.toString(10)].name;

        self.time_svg.append("text")
            .attr("x", (self.LEFT_MARGIN+(self.width-self.RIGHT_MARGIN))/2)
            .attr("y", (self.TITLE_OFFSET*0.6)-5)
            .attr("class","time_title")
            .text(title_text);

        // Series info button

        self.time_svg.append("image")
            .attr("class", "series_help")
            .attr("x", self.width - self.RIGHT_MARGIN - 7.5)
            .attr("y", self.TITLE_OFFSET*0.6 - 15)
            .attr("width", "15px")
            .attr("height", "15px")
            .attr("xlink:href", "img/question_mark.png")
            .on("mouseover", function(){
                console.log("SERIES HELP CLICKED");
                if (self.series_number in series_info) {
                    var my_text = series_info[self.series_number];
                }
                else{
                    var my_text = series_info['default'];
                }
                self.tooltip.html(my_text);
                self.tooltip.style("opacity", 1.0);

            })
            .on("mouseout", function(){
                self.tooltip.style("opacity", 0.0);
            });


        var x_scale = d3.scale.linear().domain([0,data.length]).range([self.LEFT_MARGIN,self.width-self.RIGHT_MARGIN]).clamp(true);
        var y_scale = d3.scale.linear().domain([d3.min(data, function(d,i){return d.price}),d3.max(data, function(d,i){return d.price})])
            .range([(self.pseudo_height*self.TIME_SERIES_HEIGHT_FACTOR)-self.TITLE_OFFSET - self.ARROW_OFFSET,self.TITLE_OFFSET]).clamp(true);


        // This variables are for user data scale reference

        self.left_time = x_scale(1);
        self.right_time = x_scale(data.length-1);

        // EJES

        var xAxis = d3.svg.axis().scale(x_scale).ticks(25).orient("top").tickSize(((self.pseudo_height*self.TIME_SERIES_HEIGHT_FACTOR) -self.TITLE_OFFSET -self.TITLE_OFFSET- self.ARROW_OFFSET)),
            yAxis = d3.svg.axis().scale(y_scale).ticks(5).orient("right").tickSize(self.width-self.RIGHT_MARGIN-self.LEFT_MARGIN);

          // Add the x-axis.
          self.time_svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate("+(0) +"," + ((self.pseudo_height*self.TIME_SERIES_HEIGHT_FACTOR)-self.TITLE_OFFSET - self.ARROW_OFFSET) + ")")
              .call(xAxis);

          // Add the y-axis.
          self.time_svg.append("g")
              .attr("class", "y axis")
              .attr("transform", "translate(" + (self.LEFT_MARGIN) + ",0)")
              .call(yAxis);

        var lineFunction = d3.svg.line()
                              .x(function(d,i) { return x_scale(i) + (x_scale(0.5)-x_scale(0)); })
                              .y(function(d) { return y_scale(d.price);})
                             .interpolate("linear");

        var lineGraph = self.time_svg.append("path")
                            .attr("d", lineFunction(data))
                            .attr("stroke", "black")
                            .attr("stroke-width", 2)
                            .attr("fill", "none");

       var circles = self.time_svg.selectAll("circle").data(data, function(d,i){ return i;});

       circles.enter().append("circle").attr("cx", function(d,i){ return x_scale(i) + (x_scale(0.5)-x_scale(0));})
           .attr("cy", function(d,i){ return y_scale(d.price)})
           .attr("r", self.CIRCLE_RADIUS)
           .attr("fill", function(d,i) {
               if (d.result == 1) {
                   return self.up_color;
               }
               else {
                   return self.down_color;
               }
           })
            .on("mouseover", function(d,i){
                self.tooltip.html("Date: " + d.date + "</br>Price: " + d.price + "</br>" + (d.result==1? "Trending upwards": "Trending downwards")); self.tooltip.style("opacity", 1.0);
                d3.select(this).classed("selected_circle_time", true);
            })
            .on("mouseout", function(d,i){
                self.tooltip.style("opacity", 0.0);
                d3.select(this).classed("selected_circle_time", false);
            });


        var numbers = self.time_svg.selectAll(".line_numbers").data(data, function(d,i){return i;});

        numbers.enter().append("text").attr("x", function(d,i){ return x_scale(i) + (x_scale(0.5)-x_scale(0));})
           .attr("y", function(d,i){ return (self.pseudo_height*self.TIME_SERIES_HEIGHT_FACTOR)-self.TITLE_OFFSET - self.ARROW_OFFSET+20;})
            .attr("class", "line_numbers")
           .text(function(d,i){return (i+1);});

        console.log("ARROWS!!");

        var arrows = self.time_svg.selectAll(".arrows").data(data, function(d,i){return i;});

        arrows.enter().append("image")
            .attr("class", "minus")
            .attr("x", function(d,i){return x_scale(i) + (x_scale(0.5)-x_scale(0)) -10;})
            .attr("y", (self.pseudo_height*self.TIME_SERIES_HEIGHT_FACTOR)-self.TITLE_OFFSET - self.ARROW_OFFSET + 27.5)
            .attr("width", "20px")
            .attr("height", "20px")
            .attr("xlink:href", function(d,i){return d.result=== 1 ? "img/arrow_up.png":"img/arrow_down.png" ;});

    };

    self.get_std_dev_from_series = function(std_dev_column_series){

        function average(data){
          var sum = data.reduce(function(sum, value){
            return sum + value;
          }, 0);

          var avg = sum / data.length;
          return avg;
        }

        function standardDeviation(values){
          var avg = average(values);

          var squareDiffs = values.map(function(value){
            var diff = value - avg;
            var sqrDiff = diff * diff;
            return sqrDiff;
          });

          var avgSquareDiff = average(squareDiffs);

          var stdDev = Math.sqrt(avgSquareDiff);
          return stdDev;
        }


        $.each(std_dev_column_series, function(i,d){
            console.log("======");
            console.log(d);
            console.log(d.join(","));
            console.log("======");
            std_dev_column_series[i] = standardDeviation(d);
        });


    };


    self.render = function(conditions, data_field, data_name, method)
    {
        self.series_number = conditions.game.ser;

        console.log("Rendering series number:");
        console.log(self.series_number);

        console.log("Conditions");
        console.log(conditions);
        console.log(data_field);
        console.log(data_name);

        console.log("Method");
        console.log(method);

        self.data_field = data_field;

        // 'average' or 'standard deviation'

        self.method = method;

        // Time series

        var data = self.series[self.series_number.toString(10)].series;

//        data.unshift(data[0]);

        console.log("TIME SERIES DATA");

        console.log(data);

        self.render_series(data);

        // User series

        var rows = self.prepare_users_data(conditions);

        console.log("ROWS USERS");
        console.log(rows);

        if(rows.length > 0) {


            var reA = /[^a-zA-Z]/g;
            var reN = /[^0-9]/g;

            function sortAlphaNum(a, b) {
                var aA = a.replace(reA, "");
                var bA = b.replace(reA, "");
                if (aA === bA) {
                    var aN = parseInt(a.replace(reN, ""), 10);
                    var bN = parseInt(b.replace(reN, ""), 10);
                    return aN === bN ? 0 : aN > bN ? 1 : -1;
                } else {
                    return aA > bA ? 1 : -1;
                }
            }

            rows = rows.sort(function (a, b) {
                return sortAlphaNum(a[0].game.exp, b[0].game.exp)
            });

            //        console.log(rows);

            var my_data = [];

            var my_avgs_total = {};
            var my_avgs_count = {};

            var std_dev_column_series = {};

            var max_column = 0;

            for (var i in rows) {
                for (var j in rows[i]) {
                    var round_data = rows[i][j].round;
                    var experiment = rows[i][j].game.exp;
                    var user = rows[i][j].user;

                    var column = parseInt(j, 10);

                    if (column > max_column) {
                        max_column = column;
                    }

                    my_data.push({'round_data': round_data, 'experiment': experiment, 'user': user, 'row': parseInt(i, 10) + 1, 'column': column});

                    if (!(column in my_avgs_total)) {
                        my_avgs_total[column] = 0.0;
                    }
                    if (!(column in my_avgs_count)) {
                        my_avgs_count[column] = 0;
                    }

                    if (!(column in std_dev_column_series)) {
                        std_dev_column_series[column] = [];
                    }

                    std_dev_column_series[column].push(round_data[self.data_field]);

                    my_avgs_total[column] += round_data[self.data_field];
                    my_avgs_count[column] += 1;
                }
            }

            console.log("AVGS");
            console.log(my_avgs_count);
            console.log(my_avgs_total);

            var avg_data = [];

            console.log("STD_DEVS");

            console.log(std_dev_column_series);

            self.get_std_dev_from_series(std_dev_column_series);

            console.log("STD_DEVS 2");

            console.log(std_dev_column_series);


            for (var i = 0; i < max_column + 1; i++) {
                var round_data = [];
                for (var k = 0; k < self.data_field; k++) {
                    round_data.push(0);
                }

                //            console.log(my_avgs_count[i]);
                //            console.log(my_avgs_total[i]);

                if (self.method == "average") {
                    round_data.push(my_avgs_total[i] / my_avgs_count[i]);
                    my_data.push({'round_data': round_data, 'experiment': "ALL", 'user': {'nam': "Average"}, 'row': 0, 'column': i});
                    avg_data.push({'round_data': round_data, 'experiment': "ALL", 'user': {'nam': "Average"}, 'row': 0, 'column': i});
                }
                // Standard deviation
                else {
                    round_data.push(std_dev_column_series[i]);
                    my_data.push({'round_data': round_data, 'experiment': "ALL", 'user': {'nam': "StdDev"}, 'row': 0, 'column': i});
                    avg_data.push({'round_data': round_data, 'experiment': "ALL", 'user': {'nam': "StdDev"}, 'row': 0, 'column': i});
                }


            }


            console.log(my_data);

            self.data_min = d3.min(my_data, function (d) {
                return d.round_data[self.data_field]
            });
            self.data_max = d3.max(my_data, function (d) {
                return d.round_data[self.data_field]
            });

            self.avg_min = d3.min(avg_data, function (d) {
                return d.round_data[self.data_field]
            });
            self.avg_max = d3.max(avg_data, function (d) {
                return d.round_data[self.data_field]
            });

            console.log("MINIMO MAXIMO");
            console.log(self.data_min);
            console.log(self.data_max);

            self.build_color_scale();

            var hor_scale = d3.scale.linear().domain([0, (self.MAX_USER_SERIES_INDEX - self.MIN_USER_SERIES_INDEX) - 1]).range([self.left_time, self.right_time]);

            // rows.length+1 b/c of average
            // artificial +1 row, b/c == .length+2

            var tile_height = (self.pseudo_height * (1 - self.TIME_SERIES_HEIGHT_FACTOR)) / (self.VERTICAL_TILES_PAGE);

            var ver_scale = d3.scale.linear().domain([0, rows.length + 2]).range([0, tile_height * (rows.length + 2)]).clamp(true);

            var join = self.svg.selectAll("rect.rect_matrix").data(my_data, function (d) {
                return d.row + "," + d.column;
            });

            console.log("MY DATA MY DATA MY DATA");
            console.log(my_data);

            join.enter().append("rect")
                .attr("x", function (d, i) {
                    return hor_scale(d.column - 1.0)
                })
                .attr("y", function (d, i) {
                    return d.row == 0 ? ver_scale(d.row) : ver_scale(d.row + 1);
                })
                .attr("width", function () {
                    return hor_scale(1) - hor_scale(0);
                })
                .attr("height", function () {
                    return ver_scale(1) - ver_scale(0);
                })
                .style("fill", function (d, i) {
                    return self.get_color_from_data(d)
                })
                .attr("class", "rect_matrix")
                .on("mouseover", function (d, i) {
                    if (d.round_data[self.data_field] != 0 || d.row == 0) {
                        self.tooltip.html("Value: " + d.round_data[self.data_field].toFixed(2));
                        self.tooltip.style("opacity", 1.0);
                    }
                    else {
                        self.tooltip.html("No value");
                        self.tooltip.style("opacity", 1.0);
                    }
                    d3.select(this).classed("selected_box_user", true);
                })
                .on("mouseout", function (d, i) {
                    self.tooltip.style("opacity", 0.0);
                    d3.select(this).classed("selected_box_user", false);
                });

            // AVERAGES OF DISPLAYED RECT

            var rect_averages = {};

            for (i = 0; i < my_data.length; i++) {
                var d = my_data[i];
                // NOT THE FIRST AVERAGE/STD DEV ROW
                if (d.row != 0) {
                    if (!(d.row in rect_averages)) {
                        rect_averages[parseInt(d.row, 10)] = [];
                    }

                    rect_averages[parseInt(d.row, 10)].push(d.round_data[self.data_field]);
                }
            }

            console.log("RECT AVERAGES");
            console.log(rect_averages);

            var rect_averages_array = [];

            function average(data) {
                var sum = data.reduce(function (sum, value) {
                    return sum + value;
                }, 0);

                var avg = sum / data.length;
                return avg;
            }

            $.each(Object.keys(rect_averages).sort(function (a, b) {
                return parseInt(a, 10) - parseInt(b, 10);
            }), function (i, d) {
                rect_averages_array.push(average(rect_averages[d]));

            });

            console.log("rect_averages_array");
            console.log(rect_averages_array);

            var join_avgs = self.svg.selectAll("rect.rect_avg").data(rect_averages_array);


            join_avgs.enter().append("rect")
                .classed("rect_avg", true)
                .attr("x", function (d, i) {
                    return self.right_time + (hor_scale(1) - hor_scale(0)) * 1.5;
                })
                .attr("y", function (d, i) {
                    return ver_scale(i + 2);
                })
                .attr("width", function () {
                    return hor_scale(1) - hor_scale(0);
                })
                .attr("height", function () {
                    return ver_scale(1) - ver_scale(0);
                })
                .style("fill", function (d, i) {
                    return self.color_scale(d);
                })
                .on("mouseover", function (d, i) {
                    self.tooltip.html("Row average </br>" + d);
                    self.tooltip.style("opacity", 1.0);
                    d3.select(this).classed("selected_box_user", true);
                })
                .on("mouseout", function () {
                    self.tooltip.style("opacity", 0.0);
                    d3.select(this).classed("selected_box_user", false);
                });


            // ROW AVERAGES TEXT

            self.svg.append("g")
                .attr("class", "titleRowAvg")
                .attr("transform", "translate(" + (self.right_time + (hor_scale(1) - hor_scale(0)) * 2.0) + "," + ver_scale(1) + ")")
                .append("text").text(function () {
                    return "Row avg"
                });


            //        var texts = self.svg.selectAll("text").data(my_data, function(d){return d.row + "," + d.column;});

            //        var new_data = $.
            //
            //        var texts = self.svg.selectAll("text").data(my_data, function(d,i){console.log(d.i);});

            var texts = self.svg.selectAll(".row_headers").data(my_data, function (d) {
                return d.row
            });

            texts.enter().append("text")
                .attr("x", function (d, i) {
                    return hor_scale(-1.25);
                })
                .attr("y", function (d, i) {
                    return d.row == 0 ? ver_scale(d.row + 0.8) : ver_scale(d.row + 1 + 0.8);
                })
                .attr("class", "row_headers")
                .text(function (d, i) {
                    return d.user.nam + " - " + d.experiment
                });


            // SCALES LEGEND

            // USERS

            d3.select("#users_series").append("div").attr("id", "scales_div")
                .style("left","0px")
                .style("top",$("#users_series").offset().top+"px");

            self.scale_svg = d3.select("#scales_div").append("svg")
                            .style("height","350")
                            .style("width","150");


            self.scale_svg.append("g")
              .attr("class", "legendUsers")
              .attr("transform", "translate(20,100)");


            var legendUsers = d3.legend.color()
                .shapeWidth(20)
                .orient('vertical')
                .scale(self.color_scale);

            self.scale_svg.select(".legendUsers")
                .call(legendUsers);
//
            // AVG - STDDEV

            self.scale_svg.append("g")
                .attr("class", "legendAvg")
                .attr("transform", "translate(20,25)");


            var legendAvg = d3.legend.color()
                .shapeWidth(20)
                .orient('horizontal')
                .scale(self.avg_color_scale);

            self.scale_svg.select(".legendAvg")
                .call(legendAvg);

            // SCALES TEXT

            self.scale_svg.append("g")
                .attr("class", "titleUsers")
                .attr("transform", "translate(20,90)")
                .append("text").text(function () {
                    return "Users scale"
                });

            // AVG - STDEV

            self.scale_svg.append("g")
                .attr("class", "titleAvg")
                .attr("transform", "translate(20,12)")
                .append("text").text(function () {
                    return self.method === "average" ? "Average scale" : "StdDev scale"
                });


            // fill info box

            self.fill_info_box(data_name);

            self.warningMessage.transition().duration(self.trans_time).style("opacity", 0.0).remove();
        }
        else{
            self.warningMessage.text("No data available");
        }
    };

    // Object's 'main'

    self.init();

    return self;

};
