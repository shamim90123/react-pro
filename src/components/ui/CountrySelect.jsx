// src/components/ui/CountrySelect.jsx
import AppSelect from "./AppSelect";

export default function CountrySelect({
  countries = [],        // [{id, name}]
  valueId,               // selected id (e.g., form.destination_id)
  onChangeId,            // (id|null) => void
  placeholder = "Select Country",
  isSearchable = true,
  className = "",
}) {
  const selected = countries.find((c) => c.id === valueId) || null;

  return (
    <AppSelect
      value={selected}
      onChange={(opt) => onChangeId(opt?.id ?? null)}
      options={countries}
      placeholder={placeholder}
      isSearchable={isSearchable}
      getOptionLabel={(o) => o.name}
      getOptionValue={(o) => String(o.id)}
      className={className}
      // menuPortalTarget={document.body} // uncomment if dropdown gets clipped
    />
  );
}
