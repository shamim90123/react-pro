// src/components/ui/DestinationSelect.jsx
import CountrySelect from "./CountrySelect";

export default function DestinationSelect(props) {
  return (
    <CountrySelect
      placeholder="Select Country"
      {...props}
    />
  );
}
