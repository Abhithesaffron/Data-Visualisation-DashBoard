import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const PieChart = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/data`); // Adjust your API endpoint as necessary
        const result = await response.json();

        // Filter out entries where sector is missing
        const cleanedData = result.filter(item => item.sector);

        // Group data by sector and count distinct sources
        const sectorGroups = d3.groups(cleanedData, d => d.sector)
          .map(([sector, values]) => ({
            sector,
            count: new Set(values.map(v => v.source)).size // Count distinct sources
          }));

        setData(sectorGroups);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = 350;
    const height = 350;
    const radius = Math.min(width, height) / 2;

    // Create a color scale for the pie slices
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create a pie generator
    const pie = d3.pie()
      .value(d => d.count)
      .sort(null);

    // Create an arc generator
    const arc = d3.arc()
      .innerRadius(0) // Full pie chart (no inner radius)
      .outerRadius(radius);

    // Create a pie chart group and center it with top margin
    const pieGroup = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2 + 20})`); // Add margin at the top

    // Draw pie slices
    const arcs = pieGroup.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.sector))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')

      // Add tooltips on hover
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(radius + 10)); // Enlarge slice on hover

        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .attr('font-size', '16px')
          .attr('font-weight', 'bold')
          .attr('fill', 'black') // Tooltip text color
          .text(`Sector: ${d.data.sector}, Source Count: ${d.data.count}`); // Display data in the center
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc); // Restore the original size

        svg.selectAll('.tooltip').remove(); // Remove tooltip
      });

    // Create the legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width + 50}, ${height / 2 - 150})`);

    legend.selectAll('.legend-item')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`); // Spacing between legend items

    legend.selectAll('.legend-item')
      .append('rect')
      .attr('x', 0)
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', d => colorScale(d.sector)); // Fill color based on sector

    legend.selectAll('.legend-item')
      .append('text')
      .attr('x', 50)
      .attr('y', 12)
      .text(d => d.sector) // Sector as label
      .style('font-size', '12px');

  }, [data]);

  return (
    <svg ref={svgRef} width={600} height={400}></svg>
  );
};

export default PieChart;
