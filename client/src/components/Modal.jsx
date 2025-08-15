// src/components/Modal.jsx
import React from 'react';
import { Modal as AntModal, Button } from 'antd';

/**
 * Modal component
 * @param {boolean} visible - Controls visibility
 * @param {function} onClose - Callback when modal is closed
 * @param {string} title - Modal title
 * @param {ReactNode} children - Modal content
 * @param {string} okText - Text for OK button
 * @param {string} cancelText - Text for Cancel button
 * @param {function} onOk - Callback for OK button
 * @param {boolean} okButtonPrimary - Whether OK button uses primary color
 */
const Modal = ({
  visible,
  onClose,
  title,
  children,
  okText = 'OK',
  cancelText = 'Cancel',
  onOk,
  okButtonPrimary = true,
}) => {
  return (
    <AntModal
      title={title}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {cancelText}
        </Button>,
        <Button
          key="ok"
          type={okButtonPrimary ? 'primary' : 'default'}
          onClick={onOk}
        >
          {okText}
        </Button>,
      ]}
    >
      {children}
    </AntModal>
  );
};

export default Modal;
