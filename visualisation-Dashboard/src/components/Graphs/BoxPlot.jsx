import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const BoxPlot = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null); // State to track selected sector
  const [sectorData, setSectorData] = useState([]); // State to hold the data for the selected sector
  const [countryData, setCountryData] = useState([]); // State to hold country vs relevance data for selected sector

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/data`); // Adjust your API endpoint as necessary
        const result = await response.json();

        // Filter out entries where topic or relevance is empty
        const cleanedData = result.map(item => ({
          ...item,
          sector: item.sector || 'Unknown' // Tag with "Unknown" if no sector is available
        })).filter(item => item.topic && item.relevance !== undefined);

        // Group data by sector and collect relevance scores
        const groupedData = d3.groups(cleanedData, d => d.sector)
          .map(([sector, values]) => ({
            sector,
            relevance: values.map(d => Number(d.relevance)), // Collect relevance scores as numbers
            countries: values.map(d => d.country) // Collect countries associated with this sector
          }));

        setData(groupedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = 800; // Fixed width
    const height = 550; // Increased height for better visibility
    const margin = { top: 50, right: 50, bottom: 100, left: 100 };

    // Create scales
    const xScale = d3.scaleBand()
      .domain(selectedSector ? countryData.map(d => d.country) : data.map(d => d.sector))
      .range([margin.left, width - margin.right])
      .padding(0.1); // Space between sectors

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(selectedSector ? countryData : data, d => d3.max(d.relevance))]) // Y domain based on max relevance score
      .range([height - margin.bottom, margin.top]);

    // Helper function to compute quartiles and other boxplot statistics
    const computeBoxPlotStats = (arr) => {
      const sorted = arr.sort(d3.ascending);
      const q1 = d3.quantile(sorted, 0.25);
      const median = d3.quantile(sorted, 0.5);
      const q3 = d3.quantile(sorted, 0.75);
      const min = d3.min(sorted);
      const max = d3.max(sorted);
      return { q1, median, q3, min, max };
    };

    // Process data to compute boxplot statistics
    const boxPlotData = selectedSector ? 
      countryData.map(d => ({
        country: d.country,
        ...computeBoxPlotStats(d.relevance),
      })) :
      data.map(d => ({
        sector: d.sector,
        ...computeBoxPlotStats(d.relevance),
      }));

    // Draw boxplots
    svg.selectAll('.boxplot')
      .data(boxPlotData)
      .enter()
      .append('g')
      .attr('class', 'boxplot')
      .attr('transform', d => `translate(${xScale(selectedSector ? d.country : d.sector)},0)`)
      .each(function (d) {
        const g = d3.select(this);

        // Draw the box (Q1 to Q3)
        g.append('rect')
          .attr('x', 0)
          .attr('y', yScale(d.q3))
          .attr('height', yScale(d.q1) - yScale(d.q3))
          .attr('width', xScale.bandwidth())
          .attr('fill', '#ff7f0e') // Updated color for visibility
          .attr('stroke', 'black');

        // Draw the median line
        g.append('line')
          .attr('x1', 0)
          .attr('x2', xScale.bandwidth())
          .attr('y1', yScale(d.median))
          .attr('y2', yScale(d.median))
          .attr('stroke', 'black')
          .attr('stroke-width', 2);

        // Draw whiskers (min to Q1 and Q3 to max)
        g.append('line')
          .attr('x1', xScale.bandwidth() / 2)
          .attr('x2', xScale.bandwidth() / 2)
          .attr('y1', yScale(d.min))
          .attr('y2', yScale(d.q1))
          .attr('stroke', 'black');

        g.append('line')
          .attr('x1', xScale.bandwidth() / 2)
          .attr('x2', xScale.bandwidth() / 2)
          .attr('y1', yScale(d.q3))
          .attr('y2', yScale(d.max))
          .attr('stroke', 'black');

        // Draw horizontal whisker lines
        g.append('line')
          .attr('x1', xScale.bandwidth() / 4)
          .attr('x2', 3 * xScale.bandwidth() / 4)
          .attr('y1', yScale(d.min))
          .attr('y2', yScale(d.min))
          .attr('stroke', 'black');

        g.append('line')
          .attr('x1', xScale.bandwidth() / 4)
          .attr('x2', 3 * xScale.bandwidth() / 4)
          .attr('y1', yScale(d.max))
          .attr('y2', yScale(d.max))
          .attr('stroke', 'black');
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

    // Handle sector click event
    svg.selectAll('.boxplot')
      .on('click', function (event, d) {
        const countriesInSector = data.find(sector => sector.sector === d.sector);
        const relevantCountries = cleanedData.filter(item => item.sector === d.sector);

        // Prepare country vs relevance data
        const countryRelevanceData = relevantCountries.map(item => ({
          country: item.country,
          relevance: Number(item.relevance),
        }));
        
        setCountryData(countryRelevanceData); // Set the countries data for the selected sector
        setSelectedSector(d.sector); // Set selected sector to display its data
      });

    // Back button
    if (selectedSector) {
      svg.append('text')
        .attr('x', width - margin.right)
        .attr('y', margin.top)
        .attr('text-anchor', 'end')
        .attr('fill', 'red')
        .attr('font-size', '14px')
        .text('Go Back')
        .style('cursor', 'pointer')
        .on('click', () => {
          setSelectedSector(null);
          setCountryData([]); // Clear the country data on back
        });
    }
  }, [data, selectedSector]);

  return (
    <svg ref={svgRef} width={800} height={550}></svg> // Adjusted width and height
  );
};

export default BoxPlot;
