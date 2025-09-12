import React from 'react';
import PdfToolPage from '@/pages/PdfToolPage';
import MergePdfForm from '@/forms/MergePdfForm';

const MergePdfPage = () => {
  return (
    <PdfToolPage
      title="Merge PDFs"
      description="Combine multiple PDF files into one document"
      toolType="merge"
      FormComponent={MergePdfForm}
      requirements={{
        multipleFiles: true,
        minFiles: 2,
        maxFiles: 15,
        maxSize: 10,
        acceptedTypes: ["application/pdf"]
      }} />);


};

export default MergePdfPage;