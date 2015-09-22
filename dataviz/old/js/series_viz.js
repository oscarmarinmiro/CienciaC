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

    self.TIME_SERIES_HEIGHT_FACTOR = 0.2;
    self.LEFT_MARGIN = 0;
    self.RIGHT_MARGIN = 0;

    self.parent_select = "#"+self.id_users;

    self.init = function(){

        // svg init

        console.log("Initializing series_users... en ");
        console.log(self.parent_select);
        self.svg = d3.select(self.parent_select).append("svg")
            .attr("width",self.width)
            .attr("height",self.height*(1-self.TIME_SERIES_HEIGHT_FACTOR))
            .append("g");

        // warning message

        self.warningMessage = self.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("class","chordChartTextWarning")
            .attr("x", self.width/2)
            .attr("y", self.height/2)
            .text(self.loading_message);

        self.prepare_series_data();

    };

    self.prepare_series_data = function(){

        self.series = {};

        for (var number in self.data['series'])
        {
            var my_data = self.data['series'][number];
            self.series[number] = {};

            self.series[number]['name'] = my_data.index_name;
            self.series[number]['series'] = [];

            for(var i=1; i< 31; i++){
                self.series[number]['series'].push({
                    'date': self.data.series[number]['rounds'][i.toString(10)]['date'],
                    'price': self.data.series[number]['rounds'][i.toString(10)]['price']})
            }

        }


//        console.log(self.series);

    };

    self.prepare_users_data = function(serie){

        var experiments = {};

        var rows  = [];

        for (var i in self.data['users'])
        {
            var my_user = self.data['users'][i];
            var nickname = my_user.nickname;


            for(var j in my_user.games)
            {
                var game = my_user.games[j];

                if((game.completed == 1) && (game.series == serie))
                {
                    if (typeof(game.rounds[0]) != 'undefined')
                    {
                        var row = [];

//                        console.log(game.rounds[0]);
                        var experiment = game.rounds[0][0];

//                        console.log("Experiment " + experiment + " rounds " + game.rounds.length);

                        if(!(experiment in experiments)){
                            experiments[experiment] = 0;
                        }

                        experiments[experiment]+=1;

                        for (var k in game.rounds) {
                            var round = game.rounds[k];

                            row.push([round[3], experiment, nickname]);

                        }

                        rows.push(row);
                    }
                }
            }

        }

        console.log(experiments);
//        console.log(rows);

        return rows;


    };

    self.get_color_from_data = function(d){

        if(d.result==1){
            return "#4C4";
        }
        else
        {
            return "#C44";
        }

    };

    self.render = function(series_number)
    {

        console.log("Rendering series number:");
        console.log(series_number);

        var data = self.series[series_number.toString(10)].series;

//        console.log(data);

        data = MG.convert.date(data, 'date');

//        console.log(data);

        MG.data_graphic({
            title: "Serie " + series_number + " -  " + self.series[series_number.toString(10)].name,
            data: data,
            small_text: true,
            min_y: d3.min(data, function(d){return d.price}),
            max_y: d3.max(data, function(d){return d.price}),
            xax_format: d3.time.format("%d/%m/%Y"),
            xax_count: (6),
            interpolate: "linear",
            show_tooltips: false,
            area: false,
//            interpolate: 'basic',
//            area: false,
            width: self.width,
            height: self.height*(self.TIME_SERIES_HEIGHT_FACTOR),
            target: document.getElementById('time_series'),
            x_accessor: 'date',
            y_accessor: 'price'
        });

        var rows = self.prepare_users_data(series_number);

        var reA = /[^a-zA-Z]/g;
        var reN = /[^0-9]/g;
        function sortAlphaNum(a,b) {
            var aA = a.replace(reA, "");
            var bA = b.replace(reA, "");
            if(aA === bA) {
                var aN = parseInt(a.replace(reN, ""), 10);
                var bN = parseInt(b.replace(reN, ""), 10);
                return aN === bN ? 0 : aN > bN ? 1 : -1;
            } else {
                return aA > bA ? 1 : -1;
            }
}

        rows = rows.sort(function(a,b){ return sortAlphaNum(a[0][1],b[0][1])});

        console.log(rows);

        var my_data = [];

        for(var i in rows){
            for(var j in rows[i]){
                var result = rows[i][j][0];
                var experiment = rows[i][j][1];
                var user = rows[i][j][2];
                my_data.push({'result': result, 'experiment': experiment, 'user': user, 'row': parseInt(i,10), 'column': parseInt(j,10)});
            }
        }

        var hor_scale = d3.scale.linear().domain([0,25]).range([self.LEFT_MARGIN,self.width-self.RIGHT_MARGIN]).clamp(true);

        var ver_scale = d3.scale.linear().domain([0,rows.length]).range([0,self.height*(1-self.TIME_SERIES_HEIGHT_FACTOR-0.05)]).clamp(true);

        var join = self.svg.selectAll("rect").data(my_data, function(d){return d.row + "," + d.column;});

//        console.log(my_data);

        join.enter().append("rect")
            .attr("x", function(d,i){return hor_scale(d.column)})
            .attr("y", function(d,i){return ver_scale(d.row)})
            .attr("width", function(){return hor_scale(1)-hor_scale(0);})
            .attr("height", function(){return ver_scale(1)-ver_scale(0);})
            .style("fill", function(d,i){ return self.get_color_from_data(d)})
            .attr("class", "rect_matrix")
        .append("svg:title")
             .text(function(d, i) { return d.user + " - " + d.experiment});


        self.warningMessage.transition().duration(self.trans_time).style("opacity",0.0).remove();
    };

    // Object's 'main'

    self.init();

    return self;

};
