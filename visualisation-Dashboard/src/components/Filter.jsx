import React from 'react';

const Filter = ({ filters, onFilterChange }) => {
  return (
    <div>
      <h2>Filters</h2>
      <label>
        End Year:
        <input
          type="text"
          value={filters.endYear}
          onChange={(e) => onFilterChange('endYear', e.target.value)}
        />
      </label>
      <label>
        Topic:
        <input
          type="text"
          value={filters.topic}
          onChange={(e) => onFilterChange('topic', e.target.value)}
        />
      </label>
      {/* Add more filters like sector, region, pestle, source, etc. */}
    </div>
  );
};

export default Filter;
