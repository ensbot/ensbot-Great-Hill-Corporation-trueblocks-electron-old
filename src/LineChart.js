import React, { Component } from 'react';
import * as d3 from 'd3';

export default class LineChart extends Component {

  constructor(props) {
    super(props)

    this.state = {
      chart: {}
    }

    this.myRef = React.createRef();
  }

  create = (el, data) => {
    // setup
    let chart = {
      el: el,
      margin: { top: 20, right: 20, bottom: 30, left: 50 }
    }
    chart.width = this.props.width - chart.margin.left - chart.margin.right;
    chart.height = this.props.height - chart.margin.top - chart.margin.bottom;
    chart.x = d3.scaleTime().range([0, chart.width]);
    chart.y = d3.scaleLinear().range([chart.height, 0]);
    chart.svg = d3.select(el).append("svg")
      .attr("width", chart.width + chart.margin.left + chart.margin.right)
      .attr("height", chart.height + chart.margin.top + chart.margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + chart.margin.left + "," + chart.margin.top + ")");

    // stuff to render:
    // line
    // x axis
    // y axis
    let points = this.props.dataPoints;

    chart.x.domain(d3.extent(points, function (d) { return d.date; }));
    chart.y.domain([0, d3.max(points, function (d) { return d.val; })]);

    // line
    chart.line = d3.line()
      .x((d) => { return chart.x(d.date); })
      .y((d) => { return chart.y(d.val); });

    chart.svg.append("path")
      .data([points])
      .attr("class", "line")
      .attr("d", (d) => chart.line(d));

    // Add the X Axis
    chart.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + chart.height + ")")
      .call(d3.axisBottom(chart.x).ticks(5));

    // text label for the x axis
    chart.svg.append("text")
      .attr("transform",
        "translate(" + (chart.width / 2) + " ," +
        (chart.height + chart.margin.top + 3) + ")")
      .style("text-anchor", "middle")
      .text("Date");

    let make_x_gridlines = () => {
      return d3.axisBottom(chart.x)
        .ticks(5)
    }

    let make_y_gridlines = () => {
      return d3.axisLeft(chart.y)
        .ticks(3)
    }

    // add the X gridlines
    chart.svg.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(0," + chart.height + ")")
      .call(make_x_gridlines()
        .tickSize(-chart.height)
        .tickFormat("")
      )

    // Add the Y Axis
    chart.svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(chart.y).ticks(3));

    chart.svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - chart.margin.left + 5)
      .attr("x", 0 - (chart.height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Tx Count");

    // add the Y gridlines
    chart.svg.append("g")
      .attr("class", "grid")
      .call(make_y_gridlines()
        .tickSize(-chart.width)
        .tickFormat("")
      );

    this.setState({ chart: chart });
  };

  update = (el, data, chart) => {
    // chart: el, margin, width, height, x, y, 

    let points = data

    // change domain
    chart.x.domain(d3.extent(points, function (d) { return d.date; }));
    chart.y.domain([0, d3.max(points, function (d) { return d.val; })]);

    let t0 = chart.svg.data([points]).transition().duration(750);
    
    // transition x axis
    t0.selectAll(".x.axis")
      .call(d3.axisBottom(chart.x).ticks(3));
    
    // transition y axis
    t0.selectAll(".y.axis")
      .call(d3.axisLeft(chart.y).ticks(3));
    
    // transition main line
    t0
      .select(".line")
      .attr("d", chart.line);
    
    // transition "today" line
    t0.select(".lineToday")
      .attr("x1", chart.x(Date.now()))
      .attr("x2", chart.x(Date.now()));
  };

  destroy = (el) => {
    // Cleaning code here
  };

  componentDidMount = () => {
    let el = this.myRef.current;
    this.props.dataPoints && this.create(el, this.props.dataPoints);
  }

  componentDidUpdate = (prevProps) => {
    console.log("LineChart UPDATE!");
    this.state.chart.el != undefined && this.update(this.myRef.current, this.props.dataPoints, this.state.chart);
  }

  render = () => {
    return (
      <div ref={this.myRef}>
      </div>
    )
  }
}