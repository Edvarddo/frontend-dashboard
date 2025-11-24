import React from 'react';

const FilterContainer = ({ children, className = "" }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {children}
      </div>
    </div>
  );
};

export default FilterContainer;
