import { spawn } from 'child_process';
import path from 'path';
import axios from 'axios';
import multer from 'multer';
import fs from 'fs';
import FormData from 'form-data'; // Import the `form-data` library

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:5000/";

// Configure Multer to handle file uploads
const upload = multer({ dest: 'uploads/' }); // Ensure this points to the correct directory

export const detectPhone = async (req, res) => {
  try {
    const audioFile = req.file; // Multer will attach the file to `req.file`
    
    if (!audioFile) {
      throw new Error("Audio file not uploaded");
    }

    console.log('Received file:', audioFile);

    // Create FormData and append the audio file
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(audioFile.path));

    // Send the audio file to the Flask backend
    const response = await axios.post(`${API_BASE_URL}/detect_phone`, formData, {
      headers: formData.getHeaders(), // Set the correct headers
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error processing phone audio:", error);
    res.status(500).json({ error: "Error processing phone audio" });
  }
};


export const detectSms = async (req, res) => {
  const { scamText } = req.body;

  if (!scamText) {
    return res.status(400).json({ error: 'SMS text is required' });
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/detect_sms`, { scamText });
    res.json(response.data);
  } catch (error) {
    console.error('Error while processing the SMS:', error);
    res.status(500).json({ error: 'Error occurred while processing the SMS' });
  }
};

export const detectEmail = async (req, res) => {
  const { scamText } = req.body;

  if (!scamText) {
    return res.status(400).json({ error: 'Email text is required' });
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/detect_email`, { scamText });
    res.json(response.data);
  } catch (error) {
    console.error('Error while processing the Email:', error);
    res.status(500).json({ error: 'Error occurred while processing the Email' });
  }
};

export const report = (req, res) => {
  const { report } = req.body;

  console.log("Starting model retraining...");

  const pythonProcess = spawn('C:/Users/prabh/AppData/Local/Programs/Python/Python39/python.exe', ['python/retrainer.py', JSON.stringify(report)]);

  pythonProcess.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    if (code === 0) {
      res.json({ message: "Model retrained successfully!" });
    } else {
      res.status(500).json({ message: "Model retraining failed!" });
    }
  });
};
