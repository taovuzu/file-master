import React from 'react';
import PdfToolPage from '@/components/PdfToolPage';
import PdfForm from '@/components/PdfForm';

const WatermarkPdfPage = () => {
  const WatermarkForm = ({ onFinish, disabled }) => (
    <PdfForm
      formType="watermark"
      onFinish={onFinish}
      disabled={disabled}
      config={{ buttonText: 'Add Watermark' }}
    />
  );

  return (
    <PdfToolPage
      title="Add Watermark"
      description="Add text watermark to your PDF document"
      formComponent={WatermarkForm}
      entity="watermark"
      multipleFiles={false}
      showPreview={true}
    />
  );
};

export default WatermarkPdfPage;
