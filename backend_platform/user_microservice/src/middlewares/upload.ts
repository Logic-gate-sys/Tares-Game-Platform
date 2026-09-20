import multer from 'multer';

export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    callback(null, file.mimetype.startsWith('image/'));
  },
});
