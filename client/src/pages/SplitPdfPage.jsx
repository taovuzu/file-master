import React from 'react';
import PdfToolPage from '@/components/PdfToolPage';
import PdfForm from '@/components/PdfForm';

const SplitPdfPage = () => {
  const SplitForm = ({ onFinish, disabled }) => (
    <PdfForm
      formType="split"
      onFinish={onFinish}
      disabled={disabled}
      config={{ buttonText: 'Split PDF' }}
    />
  );

  return (
    <PdfToolPage
      title="Split PDF"
      description="Split a PDF into multiple files by pages or ranges"
      formComponent={SplitForm}
      entity="split"
      multipleFiles={false}
      showPreview={true}
    />
  );
};

export default SplitPdfPage;
