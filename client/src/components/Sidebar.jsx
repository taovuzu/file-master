// src/components/SideBar.jsx
import React from "react";
import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FilePdfOutlined,
  ScissorOutlined,
  CompressOutlined,
  FileTextOutlined,
  SwapOutlined,
  NumberOutlined,
  PicCenterOutlined,
  UnlockOutlined,
  LockOutlined,
} from "@ant-design/icons";

/**
 * SideBar component
 */
const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { label: "Merge PDF", key: "merge", icon: <FilePdfOutlined />, path: "/merge" },
    { label: "Split PDF", key: "split", icon: <ScissorOutlined />, path: "/split" },
    { label: "Compress PDF", key: "compress", icon: <CompressOutlined />, path: "/compress" },
    { label: "Rotate PDF", key: "rotate", icon: <SwapOutlined />, path: "/rotate" },
    { label: "Convert PDF", key: "convert", icon: <FileTextOutlined />, path: "/convert" },
    { label: "Add Page Numbers", key: "pageNumbers", icon: <NumberOutlined />, path: "/page-numbers" },
    { label: "Add Watermark", key: "watermark", icon: <PicCenterOutlined />, path: "/watermark" },
    { label: "Unlock PDF", key: "unlock", icon: <UnlockOutlined />, path: "/unlock" },
    { label: "Protect PDF", key: "protect", icon: <LockOutlined />, path: "/protect" },
    // { label: 'eSign PDF', key: 'esign', icon: <EditOutlined /> }, // future
  ];

  // Get the current selected key based on the current path
  const getSelectedKey = () => {
    const currentPath = location.pathname;
    const item = items.find(item => item.path === currentPath);
    return item ? item.key : '';
  };

  const handleMenuClick = ({ key }) => {
    const item = items.find(item => item.key === key);
    if (item && item.path) {
      navigate(item.path);
    }
  };

  return (
    <div style={{ width: 200, minHeight: "100vh", backgroundColor: "#fff" }}>
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        onClick={handleMenuClick}
        style={{ height: "100%", borderRight: 0 }}
        items={items}
      />
    </div>
  );
};

export default SideBar;
