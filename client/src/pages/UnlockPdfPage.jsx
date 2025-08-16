import React from 'react';
import EnhancedPdfToolPage from '@/components/EnhancedPdfToolPage';
import UnlockPdfForm from '@/forms/UnlockPdfForm';

const UnlockPdfPage = () => {
  return (
    <EnhancedPdfToolPage
      title="Unlock PDF"
      description="Remove password protection from your PDF"
      toolType="unlock"
      FormComponent={UnlockPdfForm}
      requirements={{
        multipleFiles: false,
        minFiles: 1,
        maxFiles: 1,
        maxSize: 10,
      }}
    />
  );
};

export default UnlockPdfPage;
