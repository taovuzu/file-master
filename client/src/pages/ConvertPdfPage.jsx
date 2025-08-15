import React from 'react';
import PdfToolPage from '@/components/PdfToolPage';
import ConvertPdfForm from '@/forms/ConvertPdfForm';

const ConvertPdfPage = () => {
  return (
    <PdfToolPage
      title="Convert PDF"
      description="Convert PDF to Word, Excel, or image formats"
      formComponent={ConvertPdfForm} 
      entity="convert"
      multipleFiles={false}
      showPreview={true}
    />
  );
};

export default ConvertPdfPage;
