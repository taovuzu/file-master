// src/components/Tabs.jsx
import React from 'react';
import { Tabs as AntTabs } from 'antd';

const { TabPane } = AntTabs;

/**
 * Tabs component
 * @param {array} tabs - Array of { key, label, content } objects
 * @param {string} activeKey - Currently selected tab key
 * @param {function} onChange - Callback when tab changes
 */
const Tabs = ({ tabs = [], activeKey, onChange }) => {
  return (
    <AntTabs activeKey={activeKey} onChange={onChange}>
      {tabs.map((tab) => (
        <TabPane tab={tab.label} key={tab.key}>
          {tab.content}
        </TabPane>
      ))}
    </AntTabs>
  );
};

export default Tabs;
