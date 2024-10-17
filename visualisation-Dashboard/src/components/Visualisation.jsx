import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Visualisation = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr('width', 800)
      .attr('height', 500);

    // Clear any previous render
    svg.selectAll('*').remove();

    // Sample D3.js visualization (e.g., bar chart)
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => i * 50)
      .attr('y', (d) => 500 - d.intensity * 10)
      .attr('width', 40)
      .attr('height', (d) => d.intensity * 10)
      .attr('fill', 'steelblue');

  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default Visualisation;
