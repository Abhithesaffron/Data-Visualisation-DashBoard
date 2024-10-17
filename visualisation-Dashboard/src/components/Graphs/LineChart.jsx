import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const LineChart = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/data`); // Adjust your API endpoint as necessary
        const result = await response.json();

        // Filter out entries where pestle or intensity is missing
        const cleanedData = result.filter(item => item.pestle && item.intensity !== undefined);

        // Group data by pestle category
        const groupedData = d3.groups(cleanedData, d => d.pestle)
          .map(([pestle, values]) => ({
            pestle,
            intensities: values.map(d => ({
              category: pestle,
              intensity: Number(d.intensity), // Use intensity as a number
              start_year: d.start_year || 'Unknown', // Optional start year, use 'Unknown' as fallback
            }))
          }));

        setData(groupedData);
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
    const margin = { top: 50, right: 50, bottom: 100, left: 100 };

    // Get unique pestle categories
    const pestleCategories = data.map(d => d.pestle);

    // Create x-scale (pestle categories)
    const xScale = d3.scaleBand()
      .domain(pestleCategories) // Ensure the domain includes all pestle categories
      .range([margin.left, width - margin.right])
      .padding(0.1); // Padding for spacing between categories

    // Create y-scale (intensity values)
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(d.intensities, i => i.intensity))])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Define line generator
    const line = d3.line()
      .x(d => xScale(d.category) + xScale.bandwidth() / 2) // Adjust x position to be at the center of the category
      .y(d => yScale(d.intensity))
      .curve(d3.curveMonotoneX); // Apply smoothing to the line

    // Color scale for each line
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Draw the lines
    svg.selectAll('.line')
      .data(data)
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', d => line(d.intensities))
      .attr('fill', 'none')
      .attr('stroke', (d, i) => colorScale(i))
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.8) // Adjust opacity for better visibility
      .attr('stroke-dasharray', '4') // Add dashed line effect
      .on('mouseover', function () {
        d3.select(this).attr('stroke-opacity', 1);
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke-opacity', 0.8);
      });

    // Add points to the line
    svg.selectAll('.circle-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'circle-group')
      .selectAll('.circle')
      .data(d => d.intensities)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', d => xScale(d.category) + xScale.bandwidth() / 2) // Place circle in the middle of the category
      .attr('cy', d => yScale(d.intensity))
      .attr('r', 5) // Increased radius for better visibility
      .attr('fill', (d, i) => colorScale(i))
      .style('opacity', 0.9) // Increased opacity for better visibility

      // Add tooltips on hover
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 7); // Increase radius on hover
        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', d3.select(this).attr('cx'))
          .attr('y', d3.select(this).attr('cy') - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', 'black')
          .text(`Intensity: ${d.intensity}`); // Correctly display the intensity
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 5); // Restore radius after hover
        svg.selectAll('.tooltip').remove();
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
      .text('Pestle Category');

    // Add Y axis label
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height / 2))
      .attr('y', 40)
      .attr('font-size', '14px')
      .text('Intensity');

    // Add grid lines for better readability
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(10).tickSize(-width + margin.right + margin.left).tickFormat(''));

  }, [data]);

  return (
    <svg ref={svgRef} width={800} height={500}></svg>
  );
};

export default LineChart;
