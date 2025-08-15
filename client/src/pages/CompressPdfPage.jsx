import React from 'react';
import PdfToolPage from '@/components/PdfToolPage';
import PdfForm from '@/components/PdfForm';

const CompressPdfPage = () => {
  const CompressForm = ({ onFinish, disabled }) => (
    <PdfForm
      formType="compress"
      onFinish={onFinish}
      disabled={disabled}
      config={{ buttonText: 'Compress PDF' }}
    />
  );

  return (
    <PdfToolPage
      title="Compress PDF"
      description="Reduce PDF file size while maintaining quality"
      formComponent={CompressForm}
      entity="compress"
      multipleFiles={false}
      showPreview={true}
    />
  );
};

export default CompressPdfPage;
