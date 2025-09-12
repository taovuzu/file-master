import React from 'react';
import PdfToolPage from '@/pages/PdfToolPage';
import SplitPdfForm from '@/forms/SplitPdfForm';

const SplitPdfPage = () => {
  return (
    <PdfToolPage
      title="Split PDF"
      description="Split a PDF into multiple files by pages or ranges"
      toolType="split"
      FormComponent={SplitPdfForm}
      requirements={{
        multipleFiles: false,
        minFiles: 1,
        maxFiles: 1,
        maxSize: 10,
        acceptedTypes: ["application/pdf"]
      }} />);


};

export default SplitPdfPage;