import { spawn } from 'child_process';
import path from 'path';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:5000/"

export const detectPhone = (req, res) => {
    const audioPath = req.file.path;

  // Spawn Python process to run the SMS detection model
  const pythonProcess = spawn('C:/Users/prabh/AppData/Local/Programs/Python/Python39/python.exe', [path.resolve('python/phone_detector.py'), audioPath]);

  let output = ''
  pythonProcess.stdout.on("data", (data) => {
    output += data.toString();
  });

  pythonProcess.on("close", () => {
    res.json({ result: output.trim() });
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python Error: ${data}`);
    res.status(500).send("Error processing audio");
  });
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