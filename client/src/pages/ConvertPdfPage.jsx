import React from 'react';
import EnhancedPdfToolPage from '@/components/EnhancedPdfToolPage';
import ConvertPdfForm from '@/forms/ConvertPdfForm';

const ConvertPdfPage = () => {
  return (
    <EnhancedPdfToolPage
      title="Convert PDF"
      description="Convert PDF to Word, Excel, or image formats"
      toolType="convert"
      FormComponent={ConvertPdfForm}
      requirements={{
        multipleFiles: false,
        minFiles: 1,
        maxFiles: 1,
        maxSize: 10,
      }}
    />
  );
};

export default ConvertPdfPage;
