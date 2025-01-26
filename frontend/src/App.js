import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('sms'); // To toggle between tabs
  const [smsMessage, setSmsMessage] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [response, setResponse] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [scamProb, setScamProb] = useState(null);

  const getProb = (res) => {
    let newRes = res.slice(1);
    const bracketCount = (newRes.match(/\]/g) || []).length;

    let modifiedString = newRes;

    // If there are more than one `]`, remove one
    if (bracketCount > 1) {
      const secondBracketIndex = newRes.indexOf(']', newRes.indexOf(']') + 1);
      modifiedString = newRes.slice(0, secondBracketIndex) + newRes.slice(secondBracketIndex + 1);
    }

    modifiedString = modifiedString.replace(', [', '. [');

    const [numStr, arrStr] = modifiedString.split('. ');
    const scamProbability = parseFloat(numStr);
    const keywordsArray = eval(arrStr);

    setScamProb(Math.round(scamProbability)); // Set scam probability
    setKeywords(keywordsArray); // Set keywords
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page

    const endpoint = activeTab === 'sms' ? '/api/detect-sms' : '/api/detect-email';
    const message = activeTab === 'sms' ? smsMessage : emailMessage;

    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, {
        scamText: message, // Send the message in the body
      });

      setResponse(res.data); // Store the response data
    } catch (error) {
      console.error('Error:', error);
      setResponse({ error: 'Failed to detect scam message.' });
    }
  };

  useEffect(() => {
    if (response && response.result) {
      getProb(response.result); // Process response when it changes
    }
  }, [response]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Scam Detector</h1>
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'sms' ? 'active' : ''}`}
            onClick={() => setActiveTab('sms')}
          >
            SMS
          </button>
          <button
            className={`tab ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            Email
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {activeTab === 'sms' && (
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
          )}
          {activeTab === 'email' && (
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
          )}
          <br />
          <button type="submit">Detect</button>
        </form>
        {response && (
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
      </header>
    </div>
  );
}

export default App;
