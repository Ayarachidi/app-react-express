const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const app = express();
const port = 3004;

// Créer le dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure CORS
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'appdb'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

app.post('/login', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const query = `SELECT nom, prenom, id FROM data WHERE nom = ?`;
  db.query(query, [name], (error, results) => {
    if (error) return res.status(500).json({ error: 'Database query error' });
    if (results.length === 0) return res.status(404).send('User not found');
    res.json(results);
  });
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  res.json({
    message: 'File uploaded successfully.',
    file: req.file
  });
});

app.get('/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

app.post('/downloadExternal', async (req, res) => {
  const { url } = req.body;
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });

    const filename = path.basename(url);
    const filePath = path.join(__dirname, 'uploads', filename);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    writer.on('finish', () => {
      res.json({ message: 'Fichier téléchargé avec succès', filename });
    });

    writer.on('error', (err) => {
      console.error('Erreur écriture fichier :', err);
      res.status(500).send('Erreur pendant le téléchargement du fichier');
    });
  } catch (err) {
    console.error('Erreur téléchargement :', err);
    res.status(500).send('Échec du téléchargement du fichier');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
