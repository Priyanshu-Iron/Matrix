// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Set up multer to save files to 'public/images/upload'
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadDir = path.join(__dirname, 'public/images/upload/');
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);  // Save file to this directory
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));  // Add unique timestamp to the file name
//   }
// });

// const upload = multer({ storage: storage });
// module.exports = upload;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer to store files temporarily in the /tmp directory (Vercel allowed writable directory)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = '/tmp/uploads';  // /tmp is writable on Vercel
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });  // Ensure the directory exists
    }
    cb(null, uploadDir);  // Save file to this directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));  // Add unique timestamp to the file name
  }
});

// Set the file size limit (e.g., 5MB)
const upload = multer({
  storage: storage,
  limits: { fileSize: 4.2 * 1024 * 1024 }  // 5MB size limit
});

module.exports = upload;

