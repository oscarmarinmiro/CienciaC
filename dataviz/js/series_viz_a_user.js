var ccviz = ccviz || {'version': 0.1, 'controller': {}, 'viz': {} ,'extras': {} };


ccviz.viz.series_users = function(options)
{

    // Object

    var self = {};

    // Get options data

    for (key in options){
        self[key] = options[key];
    }

    console.log("SELF_VARIABLES");
    console.log(self);

    // Constants

    self.TIME_SERIES_HEIGHT_FACTOR = 0.7;
    self.ARROW_OFFSET = 20;
    self.LEFT_MARGIN = 100;
    self.RIGHT_MARGIN = 30;
    self.MIN_SERIES_INDEX = 1;
    self.MAX_SERIES_INDEX = 25;
    self.MIN_USER_SERIES_INDEX = 1;
    self.MAX_USER_SERIES_INDEX = 25;
    self.CIRCLE_RADIUS = 4;
    self.TITLE_OFFSET = 30;

    self.parent_select = "#"+self.id_users;
    self.time_parent_select = "#" + self.id_time;

    var _mousemove = function () {
        self.tooltip
                .style("left", (d3.event.pageX + 20) + "px")
                .style("top", (d3.event.pageY - 12) + "px");
    };

    self.init = function(){

        // svg init

        console.log("Initializing series_users... en ");
        console.log(self.parent_select);

        self.svg = d3.select(self.parent_select).append("svg")
            .attr("width",self.width)
            .attr("height",self.height*(1-self.TIME_SERIES_HEIGHT_FACTOR))
            .append("g").on("mousemove", _mousemove);

        console.log("Initializing series_time... en ");
        console.log(self.time_parent_select);

        self.time_svg = d3.select(self.time_parent_select).append("svg")
            .attr("width",self.width)
            .attr("height",self.height*(self.TIME_SERIES_HEIGHT_FACTOR))
            .append("g").on("mousemove", _mousemove);

        if($("#tooltip").length == 0) {
            self.tooltip = d3.select("body").append("div")
                .attr("id", "tooltip")
                .html("")
                .attr("class", "tooltip")
                .style("opacity", 0);
        }
        else{
            self.tooltip = d3.select("#tooltip");
        }

        // warning message

        self.warningMessage = self.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("class","textWarning")
            .attr("x", self.width/2)
            .attr("y", (self.height*(1-self.TIME_SERIES_HEIGHT_FACTOR)/2))
            .text(self.loading_message);

        self.prepare_series_data();

    };

    self.prepare_series_data = function(){

        self.series = {};

        var number = self.user_series_data.ser;
        self.series_number = number;
        var my_data = self.series_data;

        self.series[number] = {};

        self.series[number]['name'] = my_data.idx;
        self.series[number]['series'] = [];

            for(var i=self.MIN_SERIES_INDEX; i< self.MAX_SERIES_INDEX+1; i++){
                self.series[number]['series'].push({
                    'date': my_data['rnd'][i.toString(10)]['date'],
                    'price': my_data['rnd'][i.toString(10)]['price'],
                    'result': my_data['rnd'][i.toString(10)]['result']});
            }

    };


    self.prepare_users_data = function(){

        var rows  = [];

        var game = self.user_series_data;

        // To accelerate number crunching


        var game_data = $.extend(false, {}, game);

        delete game_data.rnd;

        // If completed

        if (game.com == 1) {

            if (typeof(game.rnd[0]) != 'undefined') {
                var row = [];


                for (var k in game.rnd) {

                    var real_round = parseInt(k)+1;


                    if((real_round>= self.MIN_USER_SERIES_INDEX) && (real_round<=self.MAX_USER_SERIES_INDEX)) {
                        var round = game.rnd[k];

                        row.push({'user': self.user_data, 'round': round, 'game': game_data});
                    }

                }

                rows.push(row);
            }

        }

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
        if(d.user.nickname!="Average") {
            return self.color_scale(d.round[self.data_field]);
        }
        else{
            return self.avg_color_scale(d.round[self.data_field]);
        }


    };


    // Build scale that corresponds to data_field, based in self.infos from controller

    self.build_color_scale = function(){
        var my_scale_info = self.infos[self.data_field];

        self.color_scale = d3.scale.linear().domain([self.data_min, (self.data_min+self.data_max)/2, self.data_max]).range([my_scale_info.range[0], my_scale_info.range[1], my_scale_info.range[2]]).clamp(true);
        self.avg_color_scale = d3.scale.linear().domain([self.avg_min, (self.avg_min+self.avg_max)/2, self.avg_max]).range([my_scale_info.range[0], my_scale_info.range[1], my_scale_info.range[2]]).clamp(true);

    };

    self.jump_to_series_detail = function(series_number){
        window.open("series_users.html?game.ser=" + series_number);
    };

    self.render_series = function(data)
    {
//        console.log("DATA PARA RENDER_SERIES");
//        console.log(data);

        // General tittle

        var title_text = "Serie " + self.series_number + " -  " + self.series[self.series_number.toString(10)].name;

        self.time_svg.append("text")
            .attr("x", (self.LEFT_MARGIN+(self.width-self.RIGHT_MARGIN))/2)
            .attr("y", self.TITLE_OFFSET*0.6)
            .attr("class","time_title")
            .text(title_text)
            .on("click", function(d,i){
                self.jump_to_series_detail(self.series_number);
            });

        // Series info button

        self.time_svg.append("image")
            .attr("class", "series_help")
            .attr("x", self.width - self.RIGHT_MARGIN - 5)
            .attr("y", self.TITLE_OFFSET*0.6 - 10)
            .attr("width", "10px")
            .attr("height", "10px")
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
            .range([(self.height*self.TIME_SERIES_HEIGHT_FACTOR)-self.TITLE_OFFSET - self.ARROW_OFFSET,self.TITLE_OFFSET]).clamp(true);

        // This variables are for user data scale reference

        self.left_time = x_scale(1);
        self.right_time = x_scale(data.length-1);

        // EJES

        var xAxis = d3.svg.axis().scale(x_scale).ticks(25).orient("top").tickSize(((self.height*self.TIME_SERIES_HEIGHT_FACTOR) -self.TITLE_OFFSET -self.TITLE_OFFSET- self.ARROW_OFFSET)),
            yAxis = d3.svg.axis().scale(y_scale).ticks(5).orient("right").tickSize(self.width-self.RIGHT_MARGIN-self.LEFT_MARGIN);

          // Add the x-axis.
          self.time_svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate("+(0) +"," + ((self.height*self.TIME_SERIES_HEIGHT_FACTOR)-self.TITLE_OFFSET - self.ARROW_OFFSET) + ")")
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
           .attr("y", function(d,i){ return (self.height*self.TIME_SERIES_HEIGHT_FACTOR)-self.TITLE_OFFSET - self.ARROW_OFFSET+20;})
            .attr("class", "line_numbers")
           .text(function(d,i){return (i+1);});

        console.log("ARROWS!!");

        var arrows = self.time_svg.selectAll(".arrows").data(data, function(d,i){return i;});

        arrows.enter().append("image")
            .attr("class", "minus")
            .attr("x", function(d,i){return x_scale(i+1) - (x_scale(0.5)-x_scale(0)) - 7.5;})
            .attr("y", (self.height*self.TIME_SERIES_HEIGHT_FACTOR)-self.TITLE_OFFSET - self.ARROW_OFFSET + 27.5)
            .attr("width", "15px")
            .attr("height", "15px")
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
//            console.log("======");
//            console.log(d);
//            console.log(d.join(","));
//            console.log("======");
            std_dev_column_series[i] = standardDeviation(d);
        });


    };


    self.render = function(method) {

        self.method = method;

        console.log("METHOD");
        console.log(self.method);

        var data = self.series[self.series_number.toString(10)].series;

        self.render_series(data);


        // User series

        var row = self.prepare_users_data()[0];

        console.log("ROWS");
        console.log(row);

        var variables_list = [[2, 'decision'], [1,'elapsed time'], [3,'error']];

        if (row.length > 0) {

            $.each(variables_list, function(i,d) {

                self.data_field = d[0];

                var data_field_name = d[1];

                var data_field = d[0];

                self.data_min = d3.min(row, function (d) {
                    return d.round[self.data_field]
                });
                self.data_max = d3.max(row, function (d) {
                    return d.round[self.data_field]
                });


                self.build_color_scale();

                var hor_scale = d3.scale.linear().domain([0, (self.MAX_USER_SERIES_INDEX - self.MIN_USER_SERIES_INDEX) - 1]).range([self.left_time, self.right_time - 1]);

                // rows.length+1 b/c of average
                var ver_scale = d3.scale.linear().domain([0, 1]).range([0, (self.height * (1 - self.TIME_SERIES_HEIGHT_FACTOR - 0.05)) / variables_list.length]).clamp(true);

                var row_svg = self.svg.append("g")
                    .attr("transform", "translate("+(0) +"," + (((self.height * (1 - self.TIME_SERIES_HEIGHT_FACTOR - 0.05)) / variables_list.length)*i) + ")");

                // Display text

                row_svg.append("text")
                    .attr("class", "row_text")
                    .attr("x", function (d, i) {
                        return self.LEFT_MARGIN-10;
                    })
                    .attr("y", function (d, i) {
                        return ver_scale(0.5);
                    }).text(data_field_name);


                var join = row_svg.selectAll("rect").data(row, function (d, i) {
                    return i;
                });

                //        console.log(my_data);

                join.enter().append("rect")
                    .attr("x", function (d, i) {
                        return hor_scale(i - 1.0)
                    })
                    .attr("y", function (d, i) {
                        return ver_scale(0)
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
                        self.tooltip.html("Value: " + d.round[data_field].toFixed(2));
                        self.tooltip.style("opacity", 1.0);
                        d3.select(this).classed("selected_box_user", true);
                    })
                    .on("mouseout", function (d, i) {
                        self.tooltip.style("opacity", 0.0);
                        d3.select(this).classed("selected_box_user", false);
                    });

                // AVERAGE RECT

                function average(data) {
                    var sum = data.reduce(function (sum, value) {
                        return sum + value;
                    }, 0);

                    var avg = sum / data.length;
                    return avg;
                }

                var to_average = [];

                $.each(row, function (i, d) {
                    to_average.push(d.round[self.data_field]);

                });

                var average_value = average(to_average);

                console.log("MEDIA RECT");
                console.log(average_value);

                self.time_svg.append("text")
                    .attr("class", "avg_text")
                    .attr("x", function (d, i) {
                        return hor_scale.range()[1] + 20 + (hor_scale(1) - hor_scale(0)) / 2;
                    })
                    .attr("y", function (d, i) {
                        return self.height * (self.TIME_SERIES_HEIGHT_FACTOR) - 10;
                    }).text("AVG");


                row_svg.append("rect")
                    .attr("x", function (d, i) {
                        return hor_scale.range()[1] + 20;
                    })
                    .attr("y", function (d, i) {
                        return ver_scale(0)
                    })
                    .attr("width", function () {
                        return hor_scale(1) - hor_scale(0);
                    })
                    .attr("height", function () {
                        return ver_scale(1) - ver_scale(0);
                    })
                    .style("fill", function (d, i) {
                        return self.color_scale(average_value);
                    })
                    .attr("class", "rect_matrix")
                    .on("mouseover", function (d, i) {
                        self.tooltip.html("Value: " + average_value.toFixed(2));
                        self.tooltip.style("opacity", 1.0);
                        d3.select(this).classed("selected_box_user", true);
                    })
                    .on("mouseout", function (d, i) {
                        self.tooltip.style("opacity", 0.0);
                        d3.select(this).classed("selected_box_user", false);
                    });
            });

            self.warningMessage.transition().duration(self.trans_time).style("opacity", 0.0).remove();
        }
        else {

            self.warningMessage.text("No data available");
        }
    };

    // Object's 'main'

    self.init();

    return self;

};
