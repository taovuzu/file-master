import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import PdfToolPage from '@/Pages/PdfToolPage';
import ConvertPdfForm from '@/forms/ConvertPdfForm';

const ConvertPdfPage = () => {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const defaultType = useMemo(() => params.get('type') || 'doc-to-pdf', [params]);
  const source = useMemo(() => params.get('source') || undefined, [params]);

  const { pageTitle, pageDescription, multiple, acceptedTypes } = useMemo(() => {
    switch (defaultType) {
      case 'image-to-pdf':
        return {
          pageTitle: 'JPG to PDF',
          pageDescription: 'Convert one or more images into a PDF. Customize layout, orientation, and margins.',
          multiple: true,
          acceptedTypes: ['image/jpeg', 'image/png']
        };
      case 'pdf-to-jpg':
        return {
          pageTitle: 'PDF to JPG',
          pageDescription: 'Convert your PDF pages into JPG images.',
          multiple: false,
          acceptedTypes: ['application/pdf']
        };
      case 'pdf-to-pptx':
        return {
          pageTitle: 'PDF to PowerPoint',
          pageDescription: 'Convert your PDF into an editable PowerPoint presentation.',
          multiple: false,
          acceptedTypes: ['application/pdf']
        };
      case 'doc-to-pdf':
        return {
          pageTitle: 'Word to PDF',
          pageDescription: 'Convert Word to high-quality PDF.',
          multiple: false,
          acceptedTypes: [
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ],
        };
    }
  }, [defaultType, source]);

  return (
    <PdfToolPage
      title={pageTitle}
      description={pageDescription}
      toolType="convert"
      FormComponent={(props) => <ConvertPdfForm {...props} defaultType={defaultType} formTitle={pageTitle} />}
      requirements={{
        multipleFiles: multiple,
        minFiles: multiple ? 1 : 1,
        maxFiles: multiple ? 20 : 1,
        maxSize: 50,
        acceptedTypes,
        allowedTypes: acceptedTypes,
      }}
    />
  );
};

export default ConvertPdfPage;
