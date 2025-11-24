import { Input } from "@/components/ui/input"

const FilterInput = ({
  label,
  value,
  onChange,
  placeholder = "Escribir...",
}) => {
  return (
    <div>
      <h2 className="mb-2 font-semibold">{label}</h2>
      <div>
        <Input
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full bg-white"
        />
      </div>
    </div>
  );
};

export default FilterInput;