const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Serve the index.html file
app.get('/', (req, res) => {
    // Read the list of uploaded files
    fs.readdir('./uploads', (err, files) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Render the HTML page with the list of files
        const fileList = files.map(file => `
            <li class="list-group-item">
                <a href="/download/${file}">${file}</a>
            </li>
        `).join('');
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>File Sharing App</title>
                <!-- Bootstrap CSS -->
                <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container mt-5">
                    <h1 class="text-center mb-4">File Sharing App</h1>
                    <div class="row">
                        <div class="col-md-6 offset-md-3">
                            <div class="card">
                                <div class="card-body">
                                    <h2 class="card-title mb-4">Uploaded Files</h2>
                                    <ul class="list-group">
                                        ${fileList}
                                    </ul>
                                    <form action="/upload" method="post" enctype="multipart/form-data" class="mt-4">
                                        <div class="form-group">
                                            <label for="file">Choose File</label>
                                            <input type="file" name="file" id="file" class="form-control-file" required>
                                        </div>
                                        <button type="submit" class="btn btn-primary">Upload File</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            
                <!-- Bootstrap JS and jQuery (optional) -->
                <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js"></script>
                <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
            </body>
            </html>
        `;
        res.send(html);
    });
});

// Handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
    res.redirect('/');
});

// Serve uploaded files
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    res.download(filePath);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
