import React from 'react';
import MultiSelect from '../MultiSelect';

const FilterMultiSelect = ({
  omitionFilterDepartment,
  label,
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  clearValues // Prop to trigger internal clear in MultiSelect if needed, though controlled value is better
}) => {
  return (
    <div className={`flex flex-col mb-4 ${omitionFilterDepartment ? 'hidden' : ''}`}>
      <h2 className="mb-2 font-semibold">{label}</h2>
      <div>
        <MultiSelect
          options={options}
          defaultValue={value}
          onValueChange={onChange}
          placeholder={placeholder}
          clearValues={clearValues}
        />
      </div>
    </div>
  );
};

export default FilterMultiSelect;
