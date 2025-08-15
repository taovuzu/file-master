// src/components/ProgressBar.jsx
import React from 'react';
import { Progress, Typography } from 'antd';

const { Text } = Typography;

/**
 * ProgressBar component
 * @param {number} percent - Progress percentage (0-100)
 * @param {boolean} showText - Whether to show text percentage
 * @param {string} status - AntD Progress status ('active', 'exception', 'normal', 'success')
 * @param {string} strokeColor - Custom color for the progress bar
 */
const ProgressBar = ({ percent = 0, showText = true, status = 'active', strokeColor }) => {
  return (
    <div style={{ margin: '16px 0' }}>
      <Progress
        percent={percent}
        status={status}
        showInfo={showText}
        strokeColor={strokeColor}
      />
      {percent === 100 && showText && <Text type="success">Completed!</Text>}
    </div>
  );
};

export default ProgressBar;
