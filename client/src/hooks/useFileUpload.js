// src/hooks/useFileUpload.js
import { useState } from "react";
import { message } from "antd";

/**
 * useFileUpload - Custom hook to handle file uploads
 *
 * @param {Object} options
 * @param {boolean} options.multiple - Allow multiple file selection
 * @param {Array} options.accept - Allowed MIME types (e.g., ['application/pdf'])
 * @param {number} options.maxFiles - Maximum number of files allowed
 */
const useFileUpload = ({ multiple = false, accept = [], maxFiles = 1 } = {}) => {
  const [fileList, setFileList] = useState([]);

  const handleChange = ({ file, fileList: newFileList }) => {
    let filteredList = newFileList;

    // Filter allowed MIME types
    if (accept.length) {
      filteredList = newFileList.filter((f) => accept.includes(f.type));
      if (filteredList.length < newFileList.length) {
        message.warning("Some files were rejected due to invalid type.");
      }
    }

    // Limit number of files
    if (!multiple && filteredList.length > 1) {
      filteredList = [filteredList[filteredList.length - 1]];
    } else if (filteredList.length > maxFiles) {
      filteredList = filteredList.slice(-maxFiles);
      message.warning(`You can only upload up to ${maxFiles} file(s).`);
    }

    setFileList(filteredList);
  };

  const resetFiles = () => setFileList([]);

  return {
    fileList,
    setFileList,
    handleChange,
    resetFiles,
  };
};

export default useFileUpload;
