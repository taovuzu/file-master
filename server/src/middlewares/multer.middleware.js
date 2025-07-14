import multer from "multer";
import path from "path";
import sanitize from "sanitize-filename";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp");
  },
  filename: (req, file, cb) => {
    const sanitizedFileName = sanitize(file.originalname);
    const randomName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${randomName}-${sanitizedFileName}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }
});


export { upload };
