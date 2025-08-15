// src/components/PageRangeSelector.jsx
import React, { useState } from 'react';
import { Input, Button, Space, Typography } from 'antd';

const { Text } = Typography;

/**
 * PageRangeSelector component
 * @param {number} totalPages - Total pages of the PDF
 * @param {function} onChange - Callback with selected range as string
 */
const PageRangeSelector = ({ totalPages, onChange }) => {
  const [range, setRange] = useState('');

  const handleApply = () => {
    // Simple validation: match pattern like "1-3,5,7-9"
    const pattern = /^(\d+(-\d+)?)(,(\d+(-\d+)?))*$/;
    if (!pattern.test(range)) {
      alert('Invalid page range format. Example: 1-3,5,7-9');
      return;
    }

    const pages = range
      .split(',')
      .map(part => part.trim())
      .filter(part => part !== '')
      .flatMap(part => {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(Number);
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        } else {
          return [Number(part)];
        }
      })
      .filter(p => p >= 1 && p <= totalPages);

    onChange(pages);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Text>Select page range (1-{totalPages}):</Text>
      <Input
        placeholder="e.g., 1-3,5,7-9"
        value={range}
        onChange={e => setRange(e.target.value)}
      />
      <Button type="primary" onClick={handleApply}>
        Apply
      </Button>
    </Space>
  );
};

export default PageRangeSelector;
