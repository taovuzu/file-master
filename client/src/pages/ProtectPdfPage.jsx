import React from 'react';
import PdfToolPage from '@/pages/PdfToolPage';
import ProtectPdfForm from '@/forms/ProtectPdfForm';

const ProtectPdfPage = () => {
  return (
    <PdfToolPage
      title="Protect PDF"
      description="Add password protection to your PDF document"
      toolType="protect"
      FormComponent={ProtectPdfForm}
      requirements={{
        multipleFiles: false,
        minFiles: 1,
        maxFiles: 1,
        maxSize: 10,
        acceptedTypes: ["application/pdf"]
      }} />);


};

export default ProtectPdfPage;