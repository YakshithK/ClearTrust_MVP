import React, { useState, useEffect } from "react";
import { ReactMic } from "react-mic";
import axios from "axios";
import "../App.css";
import { Button } from "../components/Button";
import ReportModal from "../components/reportModal";
const API_BASE_URL = 'http://localhost:4000';
const FLASK_API_BASE_URL = process.env.FLASK_APP_BACKEND_URL || "http://127.0.0.1:5000/";

function Detect() {
  const [activeTab, setActiveTab] = useState("sms"); // To toggle between tabs
  const [smsMessage, setSmsMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [response, setResponse] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [scamProb, setScamProb] = useState(null);
  const [record, setRecord] = useState(false);
  const [result, setResult] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState(""); // "false_positive" or "false_negative"

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const submitReport = async () => {
    if (scamProb === null || scamProb === undefined || !feedbackType) {
      alert("Please select a feedback type.");
      return;
    }
  
    try {
      await axios.post(`${API_BASE_URL}/api/detect-report`, { report: {
        model: activeTab,
        message: activeTab === "sms" ? smsMessage : emailMessage,
        feedback_type: feedbackType,
      }});
  
      alert("Report submitted successfully.");
      closeModal();
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report.");
    }
  };

  const startRecording = () => {
    setRecord(true);
  };

  const stopRecording = () => {
    setRecord(false);
  };

  const onStop = (recordedBlob) => {
    console.log("Recording stopped", recordedBlob);
  
    const audioFile = new File([recordedBlob.blob], "call_recording.wav", {
      type: "audio/wav",
    });
  
    const formData = new FormData();
    formData.append("audio", audioFile);
  
    // Directly send the audio file to the Flask backend
    axios
      .post(`${FLASK_API_BASE_URL}/detect_phone`, formData) // Use Flask backend URL
      .then((res) => {
        setResult(res.data.result);
      })
      .catch((err) => {
        console.error("Error uploading audio:", err);
      });
  };
  

  const tabStyle = {
    padding: "10px 20px",
    margin: "0 10px",
    cursor: "pointer",
    border: "1px solid #ccc",
    backgroundColor: "#f0f0f0",
    fontSize: "16px",
  };

  const activeTabStyle = {
    padding: "10px 20px",
    margin: "0 10px",
    cursor: "pointer",
    border: "1px solid #007bff",
    color: "white",
    backgroundColor: "#007bff",
    fontSize: "16px",
  };

  const getProb = (res) => {
    setScamProb(Math.round(res.scam_probability));
    setKeywords(res.scam_keywords);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page

    const endpoint = activeTab === "sms" ? "/api/detect-sms" : "/api/detect-email";
    const message = activeTab === "sms" ? smsMessage : emailMessage;

    try {
      const res = await axios.post(`${API_BASE_URL}${endpoint}`, {
        scamText: message, // Send the message in the body
      });

      setResponse(res.data); // Store the response data
      getProb(res.data); // Process response directly
    } catch (error) {
      console.error("Error:", error);
      setResponse({ error: "Failed to detect scam message." });
    }
  };

  return (
    <div className="Page" style={{ textAlign: "center" }}>
      <header
        className="Page-header"
        style={{
          backgroundColor: "#282c34",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "calc(10px + 2vmin)",
          color: "white",
        }}
      >
        <h1>Scam Detector</h1>
        <div className="tabs" style={{ margin: 20 }}>
          <Button
            className={`tab ${activeTab === "sms" ? "active" : ""}`}
            onClick={() => setActiveTab("sms")}
            style={activeTab === "sms" ? activeTabStyle : tabStyle}
          >
            SMS
          </Button>
          <Button
            className={`tab ${activeTab === "email" ? "active" : ""}`}
            onClick={() => setActiveTab("email")}
            style={activeTab === "email" ? activeTabStyle : tabStyle}
          >
            Email
          </Button>
          <Button
            className={`tab ${activeTab === "phone" ? "active" : ""}`}
            onClick={() => setActiveTab("phone")}
            style={activeTab === "phone" ? activeTabStyle : tabStyle}
          >
            Phone
          </Button>
        </div>

        {activeTab === "sms" && (
          <form onSubmit={handleSubmit}>
            <div>
              <textarea
                placeholder="Enter the SMS message here..."
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                rows="5"
                cols="50"
                required
              ></textarea>
            </div>
            <br />
            <Button type="submit">Detect</Button>
          </form>
        )}

        {activeTab === "email" && (
          <form onSubmit={handleSubmit}>
            <div>
              <textarea
                placeholder="Enter the Email message here..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows="5"
                cols="50"
                required
              ></textarea>
            </div>
            <br />
            <Button type="submit">Detect</Button>
          </form>
        )}

        {activeTab === "phone" && (
          <div>
            <h2>Scam Call Classifier</h2>
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
        )}

        {response && activeTab !== "phone" && (
          <div>
            <h2>Response:</h2>
            {scamProb !== null && (
              <div>
                <p>Scam Probability: {scamProb}%</p>
                <h3>Scam Keywords:</h3>
                <ul>
                  {keywords.map((word, index) => (
                    <li key={index}>{word}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {response && (
          <Button onClick={openModal}>Report Result</Button>
        )}

        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h2>Report Incorrect Classification</h2>
              <p>Scam Probability: {scamProb}%</p>

              <label>
                <input
                  type="radio"
                  name="feedback"
                  value="false_positive"
                  onChange={() => setFeedbackType("false_positive")}
                />
                False Positive (Not a Scam but Detected as Scam)
              </label>
              <br />
              <Button onClick={submitReport}>Submit Report</Button>
              <Button onClick={closeModal}>Close</Button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default Detect;
