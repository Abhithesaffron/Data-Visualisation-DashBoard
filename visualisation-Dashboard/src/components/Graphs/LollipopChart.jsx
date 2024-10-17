import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const LollipopChart = ({ data :Data, startDate, endDate }) => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  // const [startDate, setStartDate] = useState('');
  // const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // const fetchData = async () => {
    //   try {
    //     const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/data`); // Adjust your API endpoint as necessary
    //     const result = await response.json();

        // Filter out entries where the published date is missing and format the date
        const cleanedData = Data.filter(item => item.published).map(d => ({
          date: new Date(d.published), // Parse the published date
          count: 1 // Each publication counts as 1
        }));

        // Group data by date and count occurrences
        const groupedData = d3.groups(cleanedData, d => d.date.toDateString())
          .map(([date, values]) => ({
            date: new Date(date),
            count: values.length // Number of publications on that date
          }));

        console.log('Grouped Data:', groupedData); // Debugging: Check the grouped data
        setData(groupedData);
      // } catch (error) {
      //   console.error('Error fetching data:', error);
      // }
    // };

    // fetchData();
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = 800;
    const height = 500;
    const margin = { top: 50, right: 30, bottom: 50, left: 50 };

    // Filter data based on date range
    const filteredData = data.filter(d => {
      const date = d.date;
      if (startDate && endDate) {
        return date >= new Date(startDate) && date <= new Date(endDate);
      }
      return true; // No filtering if range isn't set
    });

    // Set up scales for x (date) and y (count of publications)
    const xScale = d3.scaleTime()
      .domain(d3.extent(filteredData, d => d.date))
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.count)])
      .range([height - margin.bottom, margin.top]);

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%Y-%m-%d')))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '10px');

    // Add Y axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // Add vertical lines from x-axis to each point
    svg.selectAll('.line')
      .data(filteredData)
      .enter()
      .append('line')
      .attr('x1', d => xScale(d.date))
      .attr('x2', d => xScale(d.date))
      .attr('y1', height - margin.bottom) // From x-axis
      .attr('y2', d => yScale(d.count))   // To the data point
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2);

    // Add circles at data points
    svg.selectAll('.circle')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.count))
      .attr('r', 5)
      .attr('fill', 'steelblue')

      // Add hover tooltips to display data
      .on('mouseover', function (event, d) {
        d3.select(this).attr('fill', 'orange');
        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', xScale(d.date))
          .attr('y', yScale(d.count) - 10)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .text(`${d.count} publications`);
      })
      .on('mouseout', function () {
        d3.select(this).attr('fill', 'steelblue');
        svg.selectAll('.tooltip').remove();
      });

    // Add X axis label
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + 20)
      .attr('font-size', '14px')
      .text('Date of Publication');

    // Add Y axis label
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height / 2))
      .attr('y', 15)
      .attr('font-size', '14px')
      .text('Number of Publications');

  }, [data, startDate, endDate]);

  return (
    <div>
      <svg ref={svgRef} width={800} height={530}></svg>
    </div>
  );
};

export default LollipopChart;
