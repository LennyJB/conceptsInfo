import { inputClass } from "@/lib/ui-styles";

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  required,
  autoFocus,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        autoFocus={autoFocus}
        className={inputClass}
      />
    </label>
  );
}
