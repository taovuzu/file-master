import React from 'react';
import EnhancedPdfToolPage from '@/components/EnhancedPdfToolPage';
import ProtectPdfForm from '@/forms/ProtectPdfForm';

const ProtectPdfPage = () => {
  return (
    <EnhancedPdfToolPage
      title="Protect PDF"
      description="Add password protection to your PDF document"
      toolType="protect"
      FormComponent={ProtectPdfForm}
      requirements={{
        multipleFiles: false,
        minFiles: 1,
        maxFiles: 1,
        maxSize: 10,
      }}
    />
  );
};

export default ProtectPdfPage;
