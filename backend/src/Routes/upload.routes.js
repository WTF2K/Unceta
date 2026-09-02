const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
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