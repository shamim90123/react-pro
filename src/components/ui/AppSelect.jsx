// src/components/ui/AppSelect.jsx
import Select from "react-select";

export default function AppSelect({
  value,            // selected option object OR null
  onChange,         // (option|null) => void
  options = [],
  placeholder = "Select...",
  isSearchable = true,
  getOptionLabel = (o) => o.label ?? o.name,
  getOptionValue = (o) => String(o.value ?? o.id),
  className = "",
  menuPortalTarget, // optional: to render menu in portal
}) {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      isSearchable={isSearchable}
      placeholder={placeholder}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      menuPortalTarget={menuPortalTarget}
      styles={{
        control: (base, state) => ({
          ...base,
          borderRadius: 12,
          minHeight: "unset",
          height: 40, // h-10
          borderColor: state.isFocused ? "#6366f1" : "#d1d5db",
          boxShadow: "none",
          ":hover": { borderColor: state.isFocused ? "#6366f1" : "#9ca3af" },
        }),
        valueContainer: (base) => ({ ...base, padding: "0 0.75rem" }),
        indicatorsContainer: (base) => ({ ...base, paddingRight: "0.25rem" }),
        input: (base) => ({ ...base, margin: 0, padding: 0 }),
        placeholder: (base) => ({ ...base, color: "#9ca3af" }),
        singleValue: (base) => ({ ...base, color: "#111827" }),
        menu: (base) => ({ ...base, zIndex: 50 }),
        indicatorSeparator: () => ({ display: "none" }),
      }}
      classNames={{
        control: ({ isFocused }) =>
          `h-10 rounded-lg border ${isFocused ? "ring-2 ring-indigo-500 border-indigo-500" : "border-gray-300"} shadow-none ${className}`,
        valueContainer: () => "px-3",
        placeholder: () => "text-gray-400",
        singleValue: () => "text-gray-900",
        menu: () => "mt-1 rounded-md border border-gray-200 shadow-lg z-50 bg-white",
        option: ({ isFocused, isSelected }) =>
          `px-3 py-2 cursor-pointer ${isSelected ? "bg-indigo-600 text-white" : isFocused ? "bg-gray-100" : "text-gray-900"}`,
        indicatorsContainer: () => "gap-1",
        dropdownIndicator: ({ isFocused }) => (isFocused ? "text-indigo-600" : "text-gray-500"),
        clearIndicator: () => "text-gray-500",
      }}
      classNamePrefix="select"
    />
  );
}
