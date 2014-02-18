/*
ToDo:
Stacked Layout
delete all countries with none (now deleted in data)
implement calculation for rankings 

Sonderzeichen?
*/

(function(){
	var margin = {top: 60, right: 110, bottom: 80, left: 90},
        width = 763 - margin.left - margin.right,
        height = 509 - margin.top - margin.bottom;

    //ordinal scale for countries
    var y = d3.scale.ordinal()
        .rangeRoundBands([height, 0], 0.2);

    //vertikal scale for score
    var x = d3.scale.linear()
    	.range([0, width]);

    //xAxis(Score, medals)
    var xAxis = d3.svg.axis()
    	.scale(x)
    	.orient("top")

    //later: tip, medals, country etc.
    var tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10,0])
        .html( function(d){return "<text>" + d.Deutsche_Bezeichnung + ":</br>" + d.Gold + " Gold, " 
            + d.Silber + " Silber, " + d.Bronze + " Bronze, </br> Medaillen: "
            + d.Summe + "</br>Medaillen-Punkte: " + d.Score + "</text>"})

    var svg = d3.select("body")
    	.append("svg")
    	.attr("width", width + margin.left + margin.right)
    	.attr("height", height + margin.top + margin.bottom)
    	.append("g")
    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.call(tip);

    var data;
    var input = "offiziell";

    function sortData( ) {
      data.sort(function(a, b) {
        if (input === 'offiziell') {
          return b["Offizieller Rang"]-a["Offizieller Rang"];
        } else if( input === "gdp" ) {
            return b["GDP_gew_Rang"]-a["GDP_gew_Rang"];
        } else if ( input === "team"){
            return b["Teilnehmer gew Rang"]-a["Teilnehmer gew Rang"];
        } else if( input === "population" ){
            return b["Bev_gew_Rang"]-a["Bev_gew_Rang"];
        }
      });
    }

    d3.csv("Sotschi.csv", function(error, result){
        data = result;
        var numberKeys="Gold,Silber,Bronze,Summe,Score,Offizieller Rang,Teilnehmer gew Rang,GDP_gew_Rang,Bev_gew_Rang".split(",");

        data.forEach( function(d){ 
            numberKeys.forEach( function(key){ d[key] = parseInt(d[key]) } );

        } );

      sortData( );

    	//set the domains
    	y.domain(data.map(function(d) { return d.Deutsche_Bezeichnung } ));

    	function key( name ) {
    		return function(d) {
    			return d[name];
    		}
    	}

    	var scores = data.map( key("Score") );
    	x.domain([0, d3.max(scores)]);

    	svg.append("g")
    		.attr("class", "x axis")
            .attr('transform', 'translate(' + margin.left + ',' + (height +30)+')')
    		.call(xAxis)
    		.append("text")
    		.attr("x", 60)
            .attr("y", 10)
    		.attr("dy", "0.71em")
    		.style("text-anchor", "end")
    		.text("Medaillen-Punkte");

    	var countries = svg.selectAll(".countries")
    		.data(data)
    		.enter()
    		.append("g")
    		.attr("class", "countries")
    		.attr("transform", function(d){ return "translate(0," + y(d.Deutsche_Bezeichnung) + ")" });

    	countries
    		.append("rect")
            .attr("class", "bar")
    		.attr("height", y.rangeBand())
    		.attr("x", margin.left)
    		.attr("width", function(d){
    			return x(d.Score);
    		})
    		.attr("fill", "#6b486b")//nachher als css
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide);

    	countries.append( 'text' )
    	    .attr( 'class', 'label' )
    	    .attr( 'y', y.rangeBand() )
            .attr( 'x', -30 )
    	    .attr("text-anchor", "start")
    	    .text( function(d) { return d.Deutsche_Bezeichnung } );

        d3.selectAll("li").on("click", change);

    })

    function change(){
        input = this.id;
        d3.selectAll("li.selected")
            .attr("class", "");
        d3.select(this)
            .attr("class", "selected");

        sortData( );
        y.domain(data.map( function( d ) { return d.Deutsche_Bezeichnung; }) );

        var transition = svg.transition().duration(750),
            delay = function(d,i){ return i * 50 };

        transition.selectAll(".countries")
            .delay(delay)
            .attr("transform", function(d){ return "translate(0," + y(d.Deutsche_Bezeichnung) + ")" });

    }

})();
