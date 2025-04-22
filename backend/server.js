// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); 
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, 
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb('Error: Images only (jpeg, jpg, png)!');
    }
});

// Upload code for cameraFeed to images folder
const { spawn } = require('child_process');

app.post('/api/uploads', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imagePath = path.join(__dirname, req.file.path);

        // Call the Python model
        const python = spawn('python3', ['/home/adi/Programming/AI-Attendance-System/imageToAttendance.py', imagePath]);

        let result = '';
        python.stdout.on('data', (data) => {
            result += data.toString();
        });

        python.stderr.on('data', (data) => {
            console.error(`Python error: ${data.toString()}`);
        });

        python.on('close', (code) => {
            if (code !== 0) {
                return res.status(500).json({ error: 'Python script failed' });
            }

            res.status(200).json({
                message: 'Image uploaded and processed successfully',
                filename: req.file.filename,
                name: result.trim(),  // Name returned by Python
            });
        });

    } catch (error) {
        console.error('Upload or model error:', error);
        res.status(500).json({ error: 'Server error during upload/model processing' });
    }
});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});