import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const StackedBarChart = ({ countryList }) => {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/data`); // Adjust your API endpoint as necessary
        const result = await response.json();

        // Filter out entries where country or intensity is missing
        const cleanedData = result.filter(item => item.country && item.intensity !== undefined);

        // Group data by country and sum intensities
        const groupedData = d3.groups(cleanedData, d => d.country)
          .map(([country, values]) => ({
            country,
            intensities: values.map(d => ({
              intensity: Number(d.intensity),
              year: d.start_year || 'Unknown',
            })),
            totalIntensity: d3.sum(values, d => Number(d.intensity)) // Total intensity per country
          }));

        // Sort countries by total intensity to pick the top 10
        const sortedCountries = groupedData.sort((a, b) => d3.descending(a.totalIntensity, b.totalIntensity));

        // If countryList is provided, use it; otherwise, default to top 10 countries
        const selectedCountries = countryList && countryList.length > 0
          ? countryList
          : sortedCountries.slice(0, 10).map(d => d.country);

        // Filter the data based on selected countries
        const filteredData = groupedData.filter(d => selectedCountries.includes(d.country));

        setData(filteredData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [countryList]);

  useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = 700;
    const height = 450;
    const margin = { top: 50, right: 50, bottom: 100, left: 100 };

    // Get unique countries for the x-axis
    const countries = data.map(d => d.country);

    // Get intensity categories (we'll stack intensities)
    const intensityCategories = ['intensity'];

    // Stack the data
    const stackedData = d3.stack()
      .keys(intensityCategories)
      .value((d, key) => d.totalIntensity)(data);

    // Create x-scale for countries
    const xScale = d3.scaleBand()
      .domain(countries)
      .range([margin.left, width - margin.right])
      .padding(0.2); // Space between countries

    // Create y-scale for intensity
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.totalIntensity)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Create a custom dark color palette for each country
    const darkColorPalette = [
      '#1b263b', '#0f4c81', '#005f73', '#8b0000', '#4b0082', 
      '#1c1c1c', '#191970', '#800020', '#483d8b', '#003366'
    ];

    // Create a color scale for each country using the custom dark color palette
    const colorScale = d3.scaleOrdinal()
      .domain(countries)
      .range(darkColorPalette); // Use custom dark colors

    // Draw the bars for each stack
    svg.selectAll('.stack')
      .data(stackedData)
      .enter()
      .append('g')
      .selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.data.country)) // X based on country
      .attr('y', d => yScale(d[1])) // Y based on stack height
      .attr('height', d => yScale(d[0]) - yScale(d[1])) // Bar height
      .attr('width', xScale.bandwidth()) // Bar width
      .attr('fill', d => colorScale(d.data.country)) // Use unique dark color for each country

      // Add tooltips on hover
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.7);

        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', xScale(d.data.country) + xScale.bandwidth() / 2)
          .attr('y', yScale(d[1]) - 10)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('fill', 'black')
          .text(`Country: ${d.data.country}, Intensity: ${d.data.totalIntensity}`);
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);

        svg.selectAll('.tooltip').remove();
      });

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
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
      .text('Country');

    // Add Y axis label
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height / 2))
      .attr('y', 40)
      .attr('font-size', '14px')
      .text('Intensity');

  }, [data]);

  return (
    <svg ref={svgRef} width={800} height={500}></svg>
  );
};

export default StackedBarChart;
