import React from 'react';
import PdfToolPage from '@/pages/PdfToolPage';
import UnlockPdfForm from '@/forms/UnlockPdfForm';

const UnlockPdfPage = () => {
  return (
    <PdfToolPage
      title="Unlock PDF"
      description="Remove password protection from your PDF"
      toolType="unlock"
      FormComponent={UnlockPdfForm}
      requirements={{
        multipleFiles: false,
        minFiles: 1,
        maxFiles: 1,
        maxSize: 10,
        acceptedTypes: ["application/pdf"]
      }} />);


};

export default UnlockPdfPage;