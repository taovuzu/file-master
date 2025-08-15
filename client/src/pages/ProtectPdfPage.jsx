import React from 'react';
import PdfToolPage from '@/components/PdfToolPage';
import PdfForm from '@/components/PdfForm';

const ProtectPdfPage = () => {
  const ProtectForm = ({ onFinish, disabled }) => (
    <PdfForm
      formType="protect"
      onFinish={onFinish}
      disabled={disabled}
      config={{ buttonText: 'Protect PDF' }}
    />
  );

  return (
    <PdfToolPage
      title="Protect PDF"
      description="Add password protection to your PDF document"
      formComponent={ProtectForm}
      entity="protect"
      multipleFiles={false}
      showPreview={true}
    />
  );
};

export default ProtectPdfPage;
