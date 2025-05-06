import path from 'path';
export const DB_NAME = "PDFMonster";
export const GS_PATH = process.env.GS_PATH || 'gs';
export const LIBRE_PATH = process.env.LIBRE_PATH || 'soffice';
export const QPDF_PATH = process.env.QPDF_PATH || 'qpdf';

export const USERLOGIN_TYPES = {
  GOOGLE: "GOOGLE",
  FACEBOOK: "FACEBOOK",
  EMAIL_PASSWORD: "EMAIL_PASSWORD"
};
export const AVAILABLELOGIN_TYPES = Object.values(USERLOGIN_TYPES);

export const SHARED_BASE_DIR = process.env.SHARED_BASE_DIR || '/app/shared';
export const SHARED_UPLOADS_PATH = path.join(SHARED_BASE_DIR, 'temp', 'uploads');
export const SHARED_PROCESSED_PATH = path.join(SHARED_BASE_DIR, 'public', 'processed');