const express = require('express');
const multer = require('multer');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');

const router = express.Router();
const uploadDirectory = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
const cloudinaryConfigured = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const localStorage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
  }
});
const upload = multer({
  storage: cloudinaryConfigured ? multer.memoryStorage() : localStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => callback(null, file.mimetype.startsWith('image/'))
});

function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'unceta', resource_type: 'image' },
      (error, result) => error ? reject(error) : resolve(result.secure_url)
    );
    stream.end(file.buffer);
  });
}

router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'An image file is required.' });
  if (process.env.NODE_ENV === 'production' && !cloudinaryConfigured) {
    return res.status(503).json({ message: 'Image storage is not configured.' });
  }

  try {
    const imageUrl = cloudinaryConfigured
      ? await uploadToCloudinary(req.file)
      : `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    return res.status(201).json({ imageUrl });
  } catch (error) {
    return res.status(502).json({ message: 'Unable to store the image.', error: error.message });
  }
});

module.exports = router;