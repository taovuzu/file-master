import React from 'react';
import PdfToolPage from '@/pages/PdfToolPage';
import RotatePdfForm from '@/forms/RotatePdfForm';

const RotatePdfPage = () => {
  return (
    <PdfToolPage
      title="Rotate PDF"
      description="Rotate PDF pages by 90°, 180°, or 270°"
      toolType="rotate"
      FormComponent={RotatePdfForm}
      requirements={{
        multipleFiles: false,
        minFiles: 1,
        maxFiles: 1,
        maxSize: 10,
        acceptedTypes: ["application/pdf"]
      }} />);


};

export default RotatePdfPage;