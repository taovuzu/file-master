import React from 'react';
import PdfToolPage from '@/components/PdfToolPage';
import PdfForm from '@/components/PdfForm';

const PageNumbersPdfPage = () => {
  const PageNumbersForm = ({ onFinish, disabled }) => (
    <PdfForm
      formType="pageNumbers"
      onFinish={onFinish}
      disabled={disabled}
      config={{ buttonText: 'Add Page Numbers' }}
    />
  );

  return (
    <PdfToolPage
      title="Add Page Numbers"
      description="Insert page numbers in your PDF document"
      formComponent={PageNumbersForm}
      entity="pageNumbers"
      multipleFiles={false}
      showPreview={true}
    />
  );
};

export default PageNumbersPdfPage;
