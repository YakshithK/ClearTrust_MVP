import { spawn } from 'child_process';


export const detectSms = (req, res) => {
  const { scamText } = req.body;
  
  if (!scamText) {
    return res.status(400).json({ error: 'SMS text is required' });
  }

  // Spawn Python process to run the SMS detection model
  const pythonProcess = spawn('C:/Users/prabh/AppData/Local/Programs/Python/Python39/python.exe', ['python/sms_detector.py', scamText]);

  pythonProcess.stdout.on('data', (data) => {
    const result = data.toString();
    if (!res.headersSent) { // Ensure headers are not already sent
      res.json({ result });
    }
  });

  pythonProcess.stderr.on('data', (error) => {
    console.error(`stderr: ${error}`);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error occurred while processing the SMS' });
    }
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0 && !res.headersSent) {
      res.status(500).json({ error: 'Error occurred while running the Python script' });
    }
  });
};
