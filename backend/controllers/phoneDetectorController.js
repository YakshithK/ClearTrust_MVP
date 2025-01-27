import { spawn } from 'child_process';
import path from 'path';


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