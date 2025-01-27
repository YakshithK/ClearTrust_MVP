import React, { useState } from "react";
import { ReactMic } from "react-mic";
import axios from "axios";
import { Button } from "../components/Button";

export default function Phone() {
  const [record, setRecord] = useState(false);
  const [result, setResult] = useState("");

  const startRecording = () => {
    setRecord(true);
  };

  const stopRecording = () => {
    setRecord(false);
  };

  const onStop = (recordedBlob) => {
    console.log("Recording stopped", recordedBlob);
    const formData = new FormData();
    formData.append("audio", recordedBlob.blob, "uploads/call_recording.wav");

    // Send audio to the backend
    axios
      .post("http://localhost:5000/api/detect-phone", formData)
      .then((res) => {
        setResult(res.data.result);
      })
      .catch((err) => {
        console.error("Error uploading audio:", err);
      });
  };

  return (
    <div className="App">
      <h1>Scam Call Classifier</h1>
      <ReactMic
        record={record}
        className="sound-wave"
        onStop={onStop}
        mimeType="audio/wav"
      />
      <Button onClick={startRecording}>Start Recording</Button>
      <Button onClick={stopRecording}>Stop Recording</Button>
      <p>Result: {result}</p>
    </div>
  );
}
