/// REST API ///
var dataList = [];

let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

let req = new XMLHttpRequest();
req.open('GET', url, true);
req.send();
req.onload = () =>  {

    let json = JSON.parse(req.responseText);    // store converted JSON file
    
        dataList = json.map( obj => {

        let year = obj.Year;
        let time = obj.Time;
        let seconds = obj.Seconds;
        let name = obj.Name;
        let nation = obj.Nationality;
        let doping = obj.Doping;

        return [year, time, seconds, name, nation, doping];

    });     // extract data from JSON and store in local data structure

    createPlot();

}

/// D3 scatterplot ///
let createPlot = () => {

    // specs of the svg frame //
    const w = 1000;
    const h = 600;
    const padding = 70;

    let svg = d3.select('#main')
            .append('svg')
            .attr('id', 'plot')
            .attr('height', h)
            .attr('width', w)
 
    // scales x values to width of svg frame //
    let xScale = d3.scaleLinear()
            .domain( [1993, 2016] )
            .range( [padding, w - padding] );

    // xAxis //
    let xAxis = d3.axisBottom(xScale)
            .tickValues(d3.range(1994, 2016, 2))
            .tickFormat(d3.format('i'));            // set format of xTick to integer

    svg.append('g')             // x-axis creation
        .attr('transform', 'translate(0,' + (h - padding) + ')')
        .call(xAxis)
        .attr('id', 'x-axis')
    
    svg.append('text')          // create label for x-axis
        .attr('x', w / 2)
        .attr('y', h - 20)
        .attr('id', 'x-label')
        .style('text-anchor', 'middle')
        .text('Year');

    // scale y values to height of svg frame //

    // yScale using date obj
    let yScale = d3.scaleLinear()
                .domain( [ new Date(d3.max(dataList, d => d[2]) * 1000),    // mult by 1k to get milliseconds to intialize date obj
                            new Date(d3.min(dataList, d => d[2]) * 1000) ] )
                .range( [h - padding, padding] )

    // yAxis //
    let yAxis = d3.axisLeft(yScale)
            .tickFormat(d3.timeFormat("%M:%S"))

    svg.append('g')             // y-axis creation
        .attr('transform', 'translate(' + padding + ',0)')
        .call(yAxis)
        .attr('id', 'y-axis')

    svg.append('text')          // create y label
        .attr('x', 0 - h / 2)
        .attr('y', 0)
        .attr('dy', '1em')
        .attr('id', 'y-label')
        .attr('transform', 'rotate(-90)')
        .style('text-anchor', 'middle')
        .text('Time in Minutes');

    /// legend ///
    let legend = d3.select('#main')
        .append('div')
        .attr('id', 'legend')       
        .style('left', w * 3 / 4 + 'px')        // positioning for legend container
        .style('top', h * 4 / 6 + 'px');

    // no doping
    legend.html('<span id="key1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> No doping allegations<br>\
    <span id="key2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> Riders with doping allegation')
        
    /// tooltip  ///
    let tooltip = d3.select('body')
                .append('div')
                .attr('id', 'tooltip')
                .style('position', 'absolute')
                .style('z-index', '10')
                .style('visibility', 'hidden')
                .text('Test')

    // begin adding data points in scatterplot //
    svg.selectAll('rect')       // record in data structure : [year, time, seconds, name, nation, doping]
        .data(dataList)
        .enter()
        .append('circle')
        .attr('data-xvalue', d => d[0])
        .attr('data-yvalue', d => {
            return new Date(d[2] * 1000)           
        })                      // must store date obj to yscale to pass test. 
        .attr('r', 6)
        .attr('cx', d => xScale(d[0]) )
        .attr('cy', d => yScale(new Date(d[2] * 1000)) )
        .attr('class', 'dot')
        .attr('fill', d => {
            if (d[5] === "")
                return '#347B98';
            else
                return '#B84E14';
        })
        .on('mouseover', (d) => {
            // formatting for tool tip
            let result = `${d[3]}: ${d[4]}<br>${d[0]}, Time: ${d[1]}`;
            
            if (d[5].length > 0) {
                result = result + `<br><br>${d[5]}`;  // append more information to tooltip if doper
            }
            tooltip.html(result);

            tooltip.attr('data-year', d[0]);    // added data attribute to pass FCC test

            return tooltip.style("top", d3.event.pageY +"px")
                        .style("left", d3.event.pageX +"px")
                        .style('visibility', 'visible');
        })
        .on("mouseout", () => {
            return tooltip.style("visibility", "hidden");
        });

}