import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const BubbleChart = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/data`); // Adjust your API endpoint as necessary
        const result = await response.json();

        // Filter out entries where topic is missing
        const cleanedData = result.filter(item => item.topic);

        // Group data by topic and count the number of insights per topic
        const topicGroups = d3.groups(cleanedData, d => d.topic)
          .map(([topic, values]) => ({
            topic,
            count: values.length // Count the number of insights per topic
          }));

        setData(topicGroups);
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

    const width = 800;
    const height = 500;
    const margin = { top: 150, right: 50, bottom: 100, left: 100 };

    // Create a color scale for the bubbles
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create a scale for the bubble sizes
    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d.count)]) // Domain based on count of insights
      .range([10, 50]); // Bubble sizes will range between 10 and 50 px

    // Create a simulation for the bubble chart layout
    const simulation = d3.forceSimulation(data)
      .force('charge', d3.forceManyBody().strength(5)) // Control the force between bubbles
      .force('center', d3.forceCenter(width / 2, height / 2)) // Center the bubbles
      .force('collision', d3.forceCollide().radius(d => sizeScale(d.count) + 2)) // Prevent bubble overlap
      .stop();

    // Run the simulation a few times to get a stable layout
    for (let i = 0; i < 120; i++) {
      simulation.tick();
    }

    // Draw bubbles
    const bubbles = svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('r', d => sizeScale(d.count)) // Radius based on count of insights
      .attr('cx', d => d.x) // Positioning based on the simulation
      .attr('cy', d => d.y)
      .attr('fill', d => colorScale(d.topic)) // Color based on topic
      .style('opacity', 0.8)

      // Add tooltips on hover
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 1)
          .attr('stroke', 'black')
          .attr('stroke-width', 2);

        svg.select('.tooltip').remove(); // Remove any existing tooltip
        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', width / 2) // Position tooltip at the center top of the chart
          .attr('y', 55)
          .attr('text-anchor', 'middle')
          .attr('font-size', '16px')
          .attr('font-weight', 'bold')
          .attr('fill', 'black') // Tooltip text color
          .text(`Topic: ${d.topic} , Conserned Entries: ${d.count}`);
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 0.8)
          .attr('stroke', 'none');

        svg.selectAll('.tooltip').remove(); // Remove tooltip on mouseout
      });

  }, [data]);

  return (
    <svg ref={svgRef} width={800} height={450}></svg>
  );
};

export default BubbleChart;
