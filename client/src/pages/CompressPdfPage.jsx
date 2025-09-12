import React from 'react';
import PdfToolPage from '@/pages/PdfToolPage';
import CompressPdfForm from '@/forms/CompressPdfForm';

const CompressPdfPage = () => {
  return (
    <PdfToolPage
      title="Compress PDF"
      description="Reduce PDF file size while maintaining quality"
      toolType="compress"
      FormComponent={CompressPdfForm}
      requirements={{
        multipleFiles: false,
        minFiles: 1,
        maxFiles: 1,
        maxSize: 50,
        acceptedTypes: ["application/pdf"]
      }} />);


};

export default CompressPdfPage;