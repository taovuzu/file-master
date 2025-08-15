import React from 'react';
import PdfToolPage from '@/components/PdfToolPage';
import PdfForm from '@/components/PdfForm';

const UnlockPdfPage = () => {
  const UnlockForm = ({ onFinish, disabled }) => (
    <PdfForm
      formType="unlock"
      onFinish={onFinish}
      disabled={disabled}
      config={{ buttonText: 'Unlock PDF' }}
    />
  );

  return (
    <PdfToolPage
      title="Unlock PDF"
      description="Remove password protection from your PDF"
      formComponent={UnlockForm}
      entity="unlock"
      multipleFiles={false}
      showPreview={true}
    />
  );
};

export default UnlockPdfPage;
