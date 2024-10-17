import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const ScatterPlot = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [tooltip, setTooltip] = useState(null); // State to manage tooltip content

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/data`); // Adjust your API endpoint as necessary
        const result = await response.json();

        // Filter out entries where intensity or relevance is missing
        const cleanedData = result.filter(item => item.intensity !== undefined && item.relevance !== undefined);

        // Map the data to extract only intensity and relevance
        const scatterData = cleanedData.map(d => ({
          intensity: Number(d.intensity),
          relevance: Number(d.relevance),
          topic: d.topic, // Optionally include more fields for tooltips
          region: d.region,
        }));

        setData(scatterData);
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

    const width = 700;
    const height = 400;
    const margin = { top: 50, right: 50, bottom: 100, left: 100 };

    // Create scales for x (intensity) and y (relevance)
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.intensity)]) // X domain based on intensity values
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.relevance)]) // Y domain based on relevance values
      .range([height - margin.bottom, margin.top]);

    // Add gridlines for better readability
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(10).tickSize(-height + margin.top + margin.bottom).tickFormat(''));

    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(10).tickSize(-width + margin.left + margin.right).tickFormat(''));

    // Add points to the scatterplot
    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.intensity)) // X position based on intensity
      .attr('cy', d => yScale(d.relevance)) // Y position based on relevance
      .attr('r', 6) // Radius of the points
      .attr('fill', d => d.region ? d3.schemeCategory10[d.region.charCodeAt(0) % 10] : 'steelblue') // Color of the points based on region
      .style('opacity', 0.8) // Adjust opacity for better visibility

      // Add tooltips on hover
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8) // Increase radius on hover
          .style('opacity', 1);
        
        // Set tooltip content
        setTooltip(`Topic: ${d.topic}, Intensity: ${d.intensity}, Relevance: ${d.relevance}`);
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6) // Restore radius after hover
          .style('opacity', 0.8);
        
        // Clear tooltip content
        setTooltip(null);
      });

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'middle')
      .style('font-size', '12px');

    // Add Y axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // Add X axis label
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height - 30)
      .attr('font-size', '14px')
      .text('Intensity');

    // Add Y axis label
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height / 2))
      .attr('y', 40)
      .attr('font-size', '14px')
      .text('Relevance');

    // Display tooltip at a fixed position
    if (tooltip) {
      svg.append('text')
        .attr('class', 'tooltip')
        .attr('x', width / 2)
        .attr('y', margin.top-10)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .attr('font-size', '14px')
        .text(tooltip);
    }

  }, [data, tooltip]);

  return (
    <svg ref={svgRef} width={800} height={400}></svg>
  );
};

export default ScatterPlot;
