const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const uploadDirectory = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => callback(null, file.mimetype.startsWith('image/'))
});

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'An image file is required.' });
  return res.status(201).json({ imageUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` });
});

module.exports = router;