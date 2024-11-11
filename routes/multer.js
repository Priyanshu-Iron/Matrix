const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer to save files to 'public/images/upload'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'public/images/upload/');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);  // Save file to this directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));  // Add unique timestamp to the file name
  }
});

const upload = multer({ storage: storage });
module.exports = upload;
