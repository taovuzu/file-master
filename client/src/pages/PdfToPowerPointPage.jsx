import React from 'react';
import PdfToolPage from '@/pages/PdfToolPage';
import PdfToPowerPointForm from '@/forms/PdfToPowerPointForm';

const PdfToPowerPointPage = () => {
  return (
    <PdfToolPage
      title="PDF to PowerPoint"
      description="Convert your PDF into an editable PowerPoint presentation."
      toolType="convert"
      FormComponent={PdfToPowerPointForm}
      requirements={{
        multipleFiles: false,
        minFiles: 1,
        maxFiles: 1,
        maxSize: 50,
        acceptedTypes: ['application/pdf'],
        allowedTypes: ['application/pdf']
      }} />);


};

export default PdfToPowerPointPage;