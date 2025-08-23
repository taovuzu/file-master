import multer from "multer";
import { v4 as uuidv4 } from 'uuid';
import sanitize from "sanitize-filename";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./temp/uploads");
  },
  filename: (req, file, cb) => {
    const sanitizedFileName = sanitize(file.originalname);
    const randomName = uuidv4();
    cb(null, `${randomName}___${sanitizedFileName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }
});


export { upload };
