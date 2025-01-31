import cors from 'cors'
import { fileURLToPath } from 'url'
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import detect from './routes/detector.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express();
const port = 7000;

app.use(bodyParser.json());
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true}))

app.use(express.static(path.join(__dirname, 'public')))

app.use('/api', detect);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

// Start the server
app.listen(port, () => {console.log(`Server is running on http://localhost:${port}`);});