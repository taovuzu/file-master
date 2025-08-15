// src/hooks/usePagination.js
import { useState, useCallback } from "react";

/**
 * usePagination - Custom hook to manage pagination
 *
 * @param {Object} options
 * @param {number} options.defaultPage - Initial page number
 * @param {number} options.defaultPageSize - Initial page size
 * @param {number} options.total - Total number of items
 */
const usePagination = ({ defaultPage = 1, defaultPageSize = 10, total = 0 } = {}) => {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [totalItems, setTotalItems] = useState(total);

  const onChangePage = useCallback((page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  }, []);

  const setTotal = useCallback((totalCount) => {
    setTotalItems(totalCount);
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(defaultPage);
    setPageSize(defaultPageSize);
  }, [defaultPage, defaultPageSize]);

  return {
    currentPage,
    pageSize,
    totalItems,
    onChangePage,
    setTotal,
    resetPagination,
  };
};

export default usePagination;
