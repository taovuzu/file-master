import React from 'react';
import PdfToolPage from '@/pages/PdfToolPage';
import PageNumbersPdfForm from '@/forms/PageNumbersPdfForm';

const PageNumbersPdfPage = () => {
  return (
    <PdfToolPage
      title="Add Page Numbers"
      description="Insert page numbers in your PDF document"
      toolType="page-numbers"
      FormComponent={PageNumbersPdfForm}
      requirements={{
        multipleFiles: false,
        minFiles: 1,
        maxFiles: 1,
        maxSize: 10,
        acceptedTypes: ["application/pdf"]
      }} />);


};

export default PageNumbersPdfPage;