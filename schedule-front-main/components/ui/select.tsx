import React from "react";

const Select = ({
  options,
  selectedValue,
  setSelectedValue,
  placeholder,
  disabled = false,
  className = "",
}: {
  options: { value: string; label: string }[];
  selectedValue: string | null;
  setSelectedValue: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) => {
  return (
    <select
      value={selectedValue ?? ""}
      onChange={(e) => setSelectedValue(e.target.value)}
      disabled={disabled}
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "10px 12px",
        marginBottom: "20px",
        width: "100%",
        maxWidth: "300px",
        maxHeight: "50px",
        fontFamily: "'Montserrat', sans-serif",
        fontSize: "14px",
        backgroundColor: disabled ? "#f9f9f9" : "#fff",
        color: disabled ? "#aaa" : "#333",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "border-color 0.3s ease",
      }}
      className={`${className} custom-select`}
      onFocus={(e) => (e.target.style.borderColor = "#007BFF")}
      onBlur={(e) => (e.target.style.borderColor = "#ccc")}
    >
      <option value="" disabled>
        {placeholder || "--select--"}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;