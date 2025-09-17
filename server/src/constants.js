export const DB_NAME = "PDFMonster";
// Prefer environment-provided binary paths. Fallbacks assume Linux packages are installed in PATH.
export const GS_PATH = process.env.GS_PATH || 'gs';
export const LIBRE_PATH = process.env.LIBRE_PATH || 'soffice';
export const QPDF_PATH = process.env.QPDF_PATH || 'qpdf';

export const USERLOGIN_TYPES = {
  GOOGLE: "GOOGLE",
  FACEBOOK: "FACEBOOK",
  EMAIL_PASSWORD: "EMAIL_PASSWORD"
};
export const AVAILABLELOGIN_TYPES = Object.values(USERLOGIN_TYPES);