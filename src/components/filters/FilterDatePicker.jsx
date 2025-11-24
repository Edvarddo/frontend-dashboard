import React from 'react';
import DatePicker from '../DatePicker';

const FilterDatePicker = ({
  label,
  dateRange,
  setDateRange,
  setIsValid
}) => {
  return (
    <div>
      <h2 className="mb-2 font-semibold">{label}</h2>
      <DatePicker
        dateRange={dateRange}
        setDateRange={setDateRange}
        setIsValid={setIsValid ? setIsValid : () => { }}
      />
    </div>
  );
};

export default FilterDatePicker;
