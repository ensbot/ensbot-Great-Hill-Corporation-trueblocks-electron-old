import React, {Component} from 'react';
import * as d3 from 'd3';
import moment from 'moment';

export default class TxChart extends Component {
  constructor(props) {
    super(props);

  }


  formatDataForChart = (data, timeCol) => {
    const parseDate = d3.timeParse("%Y %W"),
    formatDate = d3.timeFormat("%Y %W");

    return Object.entries(
      data
      .map((datum) => {
        datum.monthYear = formatDate(new Date(datum[timeCol] * 1000));
        return datum;
      })
    //   .reduce((acc, cur) => {
    //     acc[cur.monthYear][cur.type] = (acc[cur.monthYear][cur.type] || 0) +1;
    //     return acc;
    //   }, {}))
      .reduce((acc, cur) => {
        acc[cur.monthYear] = acc[cur.monthYear] || {};
        console.log(acc[cur.monthYear])
        acc[cur.monthYear][cur.type] = acc[cur.monthYear][cur.type] || 0;
        console.log(acc[cur.monthYear][cur.type]);
        acc[cur.monthYear][cur.type]++;
        return acc;
      }, {}))
      .map((datum) => {
        return {
          date: parseDate(datum[0]),
          // price is count
          toplevel: datum[1].toplevel || 0,
          log:      datum[1].log || 0,
          unknown:  datum[1].unknown || 0
        //   type: 
        }
      })
      .sort((a,b) => a.date - b.date);
  }

  renderChart = () => {
    if (!this.props.data.length) return null;
    let data = this.formatDataForChart(this.props.data, "timestamp");
    console.log(data);
    let formatDate = d3.timeFormat("%Y %W");
    const svg = d3.select("svg"),
      margin = {
        top: 20,
        right: 20,
        bottom: 110,
        left: 40
      },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

    svg.selectAll("*").remove();


    const x = d3.scaleBand().rangeRound([0, width]).paddingInner(0.05),
      y = d3.scaleLinear().range([height, 0]);
      const z = d3.scaleOrdinal(d3.schemeCategory10);

    svg.append("defs").append("clipPath").attr("id", "clip").append("rect").attr("width", width).attr("height", height);

    let focus = svg.append("g").attr("class", "focus").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let tickFn = (by) => {
      let startDate = moment(data[0].date);
      let diff = Math.floor(Math.abs(startDate.diff(moment(data.slice(-1)[0].date), by))) + 1;
      return [...Array(diff).keys()].map((n) => {
        return moment(startDate).add(n, by).toDate();
      });
    };

    let ticks = tickFn('weeks');
    x.domain(ticks);

    y.domain([
      0,
      d3.max(data, function(d) {
        return d.log + d.unknown + d.toplevel;
      })
    ]);

    const xAxis = d3.axisBottom(x)
      .tickFormat(d3.timeFormat("%b %d, %Y"))
      .ticks(5);
      //.tickValues(ticks.filter((tick, i) => {return i % 2 === 0}));
      
    const yAxis = d3.axisLeft(y)
      .ticks(5);
      //.tickValues(ticks.filter((tick, i) => {return i % 2 === 0}));

      let tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0)
          .style("display", "none");

    let series = d3.stack()
    .keys(["toplevel", "log", "unknown"])
    (data);

    focus.selectAll("g")
    .data(series)
    .enter().append("g")
        .attr("fill", (d) => z(d.key))
    .selectAll("rect")
    .data((d) => d)
    .enter().append("rect")
    .attr("class", "bar-rect")
    .attr("x", (d) => x(d.data.date))
    .attr("width", x.bandwidth())
    .attr("y", (d) =>y(d[1]))
    .attr("height", (d) => y(d[0]) - y(d[1]))
    .on("mouseover", function(d) {
      tooltip.transition()
          .duration(200)
          .style("display", "block")
          .style("opacity", .9);
      tooltip.html(`
        <strong>${d.data.date.toDateString()}</strong> (week)<br/>
        ${d.data.toplevel} from tx 'from' | 'to'<br/>
        ${d.data.log} from tx log<br/>
        ${d.data.unknown} from tx abyss
        `)
      .style("left", (d3.event.pageX + 10) + "px")
      .style("top", (d3.event.pageY - 28) + "px")
    })
    .on("mouseout", function(d) {
          tooltip.transition()
              .duration(500)
              .style("opacity", 0)
              .style("display", "none");
    });


    focus.append("g").attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    focus.append("g").attr("class", "axis axis--y").call(yAxis);
  }

  componentDidMount = () => {
    this.renderChart();
  }

  componentDidUpdate = () => {
    this.renderChart();
  }

  // anim = () => {
  //   let data = this.formatDataForChart(this.props.data);
  //   //console.log(data);
  //   d3.select("svg")
  //     .selectAll('*')
  // }

  render() {
    return (
      <div>
        <svg width={this.props.width} height={this.props.height}></svg>
      </div>
    );
  }
}