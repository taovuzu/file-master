import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import PdfToolPage from "@/pages/PdfToolPage";
import ConvertPdfForm from "@/forms/ConvertPdfForm";

const ConvertPdfPage = () => {
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const defaultType = useMemo( 
    () => params.get("type") || "doc-to-pdf",
    [params]
  );
  const source = useMemo(() => params.get("source") || undefined, [params]);

  const { pageTitle, pageDescription, toolType, multiple, acceptedTypes } =
  useMemo(() => {
    switch (defaultType) {
      case "image-to-pdf":
        return {
          pageTitle: "JPG to PDF",
          toolType: "image-to-pdf",
          pageDescription:
          "Convert one or more images into a PDF. Customize layout, orientation, and margins.",
          multiple: true,
          acceptedTypes: ["image/jpeg", "image/png"]
        };
      case "pdf-to-jpg":
        return {
          pageTitle: "PDF to JPG",
          toolType: "convert",
          pageDescription: "Convert your PDF pages into JPG images.",
          multiple: false,
          acceptedTypes: ["application/pdf"]
        };
      case "pdf-to-pptx":
        return {
          pageTitle: "PDF to PowerPoint",
          toolType: "convert",
          pageDescription:
          "Convert your PDF into an editable PowerPoint presentation.",
          multiple: false,
          acceptedTypes: ["application/pdf"]
        };
      case "doc-to-pdf":
        return {
          pageTitle: "Word to PDF",
          toolType: "convert",
          pageDescription: "Convert Word to high-quality PDF.",
          multiple: false,
          acceptedTypes: [
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]

        };
      case "ppt-to-pdf":
        return {
          pageTitle: "PowerPoint to PDF",
          toolType: "convert",
          pageDescription: "Convert PowerPoint to high-quality PDF.",
          multiple: false,
          acceptedTypes: [
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"]

        };
      case "excel-to-pdf":
        return {
          pageTitle: "Excel to PDF",
          toolType: "convert",
          pageDescription: "Convert Excel to high-quality PDF.",
          multiple: false,
          acceptedTypes: [
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]

        };
    }
  }, [defaultType, source]);

  return (
    <PdfToolPage
      title={pageTitle}
      description={pageDescription}
      toolType={toolType}
      FormComponent={(props) =>
      <ConvertPdfForm
        {...props}
        defaultType={defaultType}
        formTitle={pageTitle} />

      }
      requirements={{
        multipleFiles: multiple,
        minFiles: multiple ? 1 : 1,
        maxFiles: multiple ? 20 : 1,
        maxSize: 50,
        acceptedTypes,
        allowedTypes: acceptedTypes
      }} />);


};

export default ConvertPdfPage;