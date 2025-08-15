import React from 'react';
import PdfToolPage from '@/components/PdfToolPage';
import PdfForm from '@/components/PdfForm';

const RotatePdfPage = () => {
  const RotateForm = ({ onFinish, disabled }) => (
    <PdfForm
      formType="rotate"
      onFinish={onFinish}
      disabled={disabled}
      config={{ buttonText: 'Rotate PDF' }}
    />
  );

  return (
    <PdfToolPage
      title="Rotate PDF"
      description="Rotate PDF pages by 90°, 180°, or 270°"
      formComponent={RotateForm}
      entity="rotate"
      multipleFiles={false}
      showPreview={true}
    />
  );
};

export default RotatePdfPage;
