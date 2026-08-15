const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

// Local-disk storage for development. In production, swap `storage` for
// an S3/Cloudinary multer-storage adapter — nothing else in the app
// needs to change, since routes only depend on req.file(s).url shape.
const uploadRoot = path.join(process.cwd(), env.uploadDir);
if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadRoot),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  // ZIP is accepted for the E-Aadhaar KYC upload; browsers send either
  // application/zip or application/x-zip-compressed.
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/zip', 'application/x-zip-compressed'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Unsupported file type'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB — password-protected Aadhaar ZIPs can be larger
});

module.exports = upload;
