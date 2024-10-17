import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Heatmap = ({ data, countryList }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return; // Ensure there is data to render

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Adjusted width and height for a smaller plot size
    const width = 700;
    const height = 350;
    const margin = { top: 60, right: 30, bottom: 70, left: 150 };

    // Filter out entries where country or sector is empty
    const cleanedData = data.filter(item => item.country && item.sector);

    // Process the data to count the occurrences of each country-sector pair
    const processedData = cleanedData.reduce((acc, curr) => {
      const country = curr.country;
      const sector = curr.sector;
      const value = 1; // Ensure value is numeric

      if (!acc[country]) acc[country] = {};
      if (!acc[country][sector]) acc[country][sector] = 0;

      acc[country][sector] += value;
      return acc;
    }, {});

    // Convert processed data to a format suitable for D3
    const heatmapData = [];
    for (const country in processedData) {
      for (const sector in processedData[country]) {
        heatmapData.push({
          country,
          sector,
          value: processedData[country][sector], // Ensure correct value is passed
        });
      }
    }

    // Get top 10 countries by total value if no countryList is provided
    let topCountries = d3.rollups(heatmapData, v => d3.sum(v, d => d.value), d => d.country)
      .sort((a, b) => d3.descending(a[1], b[1]))
      .map(d => d[0])
      .slice(0, 10);

    const selectedCountries = countryList && countryList.length > 0 ? countryList : topCountries;

    console.log(selectedCountries);

    // Filter data based on selected countries
    const filteredData = heatmapData.filter(d => selectedCountries.includes(d.country));

    // Get unique sectors
    const sectors = Array.from(new Set(filteredData.map(d => d.sector)));

    // Create scales for x (countries) and y (sectors)
    const xScale = d3.scaleBand()
      .domain(selectedCountries)
      .range([margin.left, width - margin.right])
      .padding(0.02); // Reduced padding for better spacing

    const yScale = d3.scaleBand()
      .domain(sectors)
      .range([height - margin.bottom, margin.top])
      .padding(0.02); // Reduced padding for better spacing

    // Create a color scale based on the values using a more vibrant color scheme
    const colorScale = d3.scaleSequential(d3.interpolateInferno) // Using the Inferno color scale for vibrancy
      .domain([0, d3.max(filteredData, d => d.value)]); // Domain based on value range

    // Append the rectangles (heatmap cells)
    svg.selectAll('.rect')
      .data(filteredData)
      .enter()
      .append('rect')
      .attr('class', 'rect')
      .attr('x', d => xScale(d.country)) // X position based on country
      .attr('y', d => yScale(d.sector)) // Y position based on sector
      .attr('width', xScale.bandwidth() * 0.8) // Adjusted width for smaller boxes
      .attr('height', yScale.bandwidth() * 0.8) // Adjusted height for smaller boxes
      .attr('fill', d => colorScale(d.value)) // Color based on the value
      .style('stroke', 'white') // White borders between cells
      .style('opacity', 0.8) // Slight transparency

      // Add tooltips on hover
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 1);

        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', width / 2) // Fixed position for the tooltip
          .attr('y', margin.top - 10) // Display above the graph
          .attr('text-anchor', 'middle')
          .attr('fill', 'black')
          .attr('font-size', '12px')
          .text(`${d.sector}, ${d.country}: ${d.value}`); // Correctly display the value
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 0.8);
        svg.selectAll('.tooltip').remove();
      });

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)') // Rotate to prevent overlap
      .style('text-anchor', 'end')
      .style('font-size', '12px');

    // Add Y axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px'); // Set the Y axis font size

  }, [data, countryList]);

  return (
    <svg ref={svgRef} width={800} height={400}></svg> // Adjusted width and height
  );
};

export default Heatmap;
