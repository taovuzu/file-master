// src/components/SelectorBox.jsx
import React from 'react';
import { Select, Typography } from 'antd';

const { Text } = Typography;
const { Option } = Select;

/**
 * SelectorBox component
 * @param {string} label - Label above the select box
 * @param {array} options - Array of { value, label } objects
 * @param {function} onChange - Callback when selection changes
 * @param {any} value - Controlled value
 * @param {string} placeholder - Placeholder text
 */
const SelectBox = ({ label, options = [], onChange, value, placeholder = 'Select...' }) => {
  return (
    <div style={{ margin: '12px 0' }}>
      {label && <Text strong>{label}</Text>}
      <Select
        style={{ width: '100%', marginTop: 4 }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      >
        {options.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            {opt.label}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default SelectBox;
