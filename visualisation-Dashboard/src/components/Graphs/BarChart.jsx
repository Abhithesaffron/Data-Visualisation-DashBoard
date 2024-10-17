import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BarChart = ({ data, width = 800, height = 400 }) => { // Reduced the default width
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return; // Ensure there is data to render

    // Filter out data points with no sector name
    const filteredData = data.filter(d => d.sector);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const margin = { top: 50, right: 50, bottom: 100, left: 50 };

    // Set the dimensions of the chart
    svg.attr('width', width).attr('height', height);

    // Create scales
    const x = d3.scaleBand()
      .domain(filteredData.map(d => d.sector)) // X-axis: sectors
      .range([margin.left, width - margin.right]) // Adjust range
      .padding(0.1); // Increase padding to make the bars narrower

    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.intensity)]) // Y-axis: intensity
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Add x-axis without tick labels (only "Sector" label will be shown)
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat('')) // Remove x-axis tick labels
      .selectAll('text')
      .remove(); // Ensure no extra labels are shown

    // Add x-axis label ("Sector")
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', (width / 2))
      .attr('y', height - margin.bottom + 40) // Adjust position
      .attr('font-size', '14px')
      .text('Sector');

    // Add y-axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Add y-axis label
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height / 2))
      .attr('y', 15)
      .attr('font-size', '14px')
      .text('Intensity');

    // Assign random colors for each sector
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create bars with assigned colors
    svg.selectAll('.bar')
      .data(filteredData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.sector)) // X position based on sector
      .attr('y', d => y(d.intensity)) // Y position based on intensity
      .attr('height', d => y(0) - y(d.intensity)) // Height based on intensity
      .attr('width', x.bandwidth() * 0.6) // Reduced width of the bars for a compact look
      .attr('fill', d => colorScale(d.sector)) // Assign color for each sector

      // Add tooltips on hover
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 0.7);
        
        // Tooltip at the top of the plot
        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', (width / 2)) // Tooltip centered
          .attr('y', margin.top - 25) // Tooltip positioned at the top
          .attr('text-anchor', 'middle')
          .attr('font-size', '16px')
          .attr('font-weight', 'bold')
          .text(`Sector: ${d.sector}, Intensity: ${d.intensity}`);
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 1);
        svg.selectAll('.tooltip').remove(); // Remove tooltip on mouseout
      });

  }, [data, width, height]); // Dependencies include width and height

  return (
    <svg ref={svgRef}></svg>
  );
};

export default BarChart;
