import React from 'react';
import EnhancedPdfToolPage from '@/components/EnhancedPdfToolPage';
import PageNumbersPdfForm from '@/forms/PageNumbersPdfForm';

const PageNumbersPdfPage = () => {
  return (
    <EnhancedPdfToolPage
      title="Add Page Numbers"
      description="Insert page numbers in your PDF document"
      toolType="pageNumbers"
      FormComponent={PageNumbersPdfForm}
      requirements={{
        multipleFiles: false,
        minFiles: 1,
        maxFiles: 1,
        maxSize: 10,
      }}
    />
  );
};

export default PageNumbersPdfPage;
