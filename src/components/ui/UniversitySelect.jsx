// src/components/ui/UniversitySelect.jsx
import AppSelect from "./AppSelect";

/**
 * universities: string[] | {id:any, name:string}[]
 * valueName: string | null   (selected university name)
 * onChangeName: (name|null) => void
 */
export default function UniversitySelect({
  universities = [],
  valueName,
  onChangeName,
  placeholder = "Select University",
  isSearchable = true,
  className = "",
}) {
  // normalize to { id, name } list
  const options = (universities || []).map((u, idx) =>
    typeof u === "string" ? { id: u, name: u } : { id: u.id ?? idx, name: u.name }
  );

  const selected =
    options.find((o) => (valueName ? o.name === valueName : false)) ?? null;

  return (
    <AppSelect
      value={selected}
      onChange={(opt) => onChangeName(opt?.name ?? null)}
      options={options}
      placeholder={placeholder}
      isSearchable={isSearchable}
      getOptionLabel={(o) => o.name}
      getOptionValue={(o) => String(o.id)}
      className={className}
      // menuPortalTarget={document.body} // uncomment if needed
    />
  );
}
