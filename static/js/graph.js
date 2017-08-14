queue()
   .defer(d3.json, "/lifedata/hpi")
   .await(makeGraphs);

function makeGraphs(error, projectsJson) {

    lifehpi = projectsJson;

    //Create a Crossfilter instance
    var ndx = crossfilter(lifehpi);

    //Define Dimensions
    var countryDim = ndx.dimension(function (d) {
        return d["Country"];  //  matches
    });

    var ccDim = ndx.dimension(function (d) {
        return d["CountryCode"];  //  matches
    });

    //Calculate metrics
    var lifeYears = countryDim.group().reduceSum(dc.pluck('Life Expectancy'));

    var worldlifeYears = ccDim.group().reduceSum(dc.pluck('Life Expectancy'));

    //Define charts
    var countryChart = dc.barChart("#Country-chart");

    var worldChart = dc.geoChoroplethChart("#World-chart");
    
    var colors = d3.scale.linear().range(["#17202A", "#424949", "#4D5656", "#626567", "#7B7D7D", "#B3B6B7", "#D0D3D4"]);

    countryChart
        .width(1000)
        .height(200)
        .margins({top: 10, right: 40, bottom: 100, left: 40})
        .dimension(countryDim)
        .group(lifeYears)
        .x(d3.scale.ordinal().domain(countryDim))
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Countries")
        .yAxis().ticks(4);

    d3.json("/static/lib/js/countries.json", function(worldcountries) {
    worldChart
        .dimension(ccDim)
        .width(1000)
        .height(450)
        .group(worldlifeYears)
        .colors(d3.scale.quantize().range(["#17202A", "#424949", "#4D5656", "#626567", "#7B7D7D", "#B3B6B7", "#D0D3D4"]))
        .colorDomain([0, 90])
        .colorCalculator(function (d) { return d ? worldChart.colors()(d) : '#ccc'; })
        .overlayGeoJson(worldcountries.features, "country", function(d) {
            return d.id;
        })
        .projection(d3.geo.mercator()
            );

   dc.renderAll();
   });
}