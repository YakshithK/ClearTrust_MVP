import React, { useState } from "react";

function ReportModal({ show, onClose, onSubmit }) {
  const [feedback, setFeedback] = useState("");

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Report Incorrect Classification</h2>
        <p>Is this a false positive or false negative?</p>
        <select value={feedback} onChange={(e) => setFeedback(e.target.value)}>
          <option value="">Select an option</option>
          <option value="false_positive">False Positive</option>
          <option value="false_negative">False Negative</option>
        </select>
        <br />
        <button onClick={() => onSubmit(feedback)}>Submit</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default ReportModal;
