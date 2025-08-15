import React from 'react';
import PdfToolPage from '@/components/PdfToolPage';
import PdfForm from '@/components/PdfForm';

const ConvertPdfPage = () => {
  const ConvertForm = ({ onFinish, disabled }) => (
    <PdfForm
      formType="convert"
      onFinish={onFinish}
      disabled={disabled}
      config={{ buttonText: 'Convert PDF' }}
    />
  );

  return (
    <PdfToolPage
      title="Convert PDF"
      description="Convert PDF to Word, Excel, or image formats"
      formComponent={ConvertForm}
      entity="convert"
      multipleFiles={false}
      showPreview={true}
    />
  );
};

export default ConvertPdfPage;
