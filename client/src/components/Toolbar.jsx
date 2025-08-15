// src/components/ToolBar.jsx
import React from 'react';
import { Button, Space } from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

/**
 * ToolBar component
 * @param {array} actions - Array of { label, icon, onClick, type } objects
 */
const ToolBar = ({ actions = [] }) => {
  return (
    <div style={{ margin: '16px 0', display: 'flex', justifyContent: 'flex-start' }}>
      <Space>
        {actions.map((action, index) => (
          <Button
            key={index}
            type={action.type || 'default'}
            icon={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
      </Space>
    </div>
  );
};

export default ToolBar;
