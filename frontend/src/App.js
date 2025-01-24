import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import Axios
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [scamProb, setScamProb] = useState(null);

  const getProb = (res) => {
    let newRes = res.slice(1);
    
    const bracketCount = (newRes.match(/\]/g) || []).length;

    let modifiedString = newRes;

    // If there are more than one `]`, remove one
    if (bracketCount > 1) {
      // Find the index of the second `]` and remove it
      const secondBracketIndex = newRes.indexOf(']', newRes.indexOf(']') + 1);
      modifiedString = newRes.slice(0, secondBracketIndex) + newRes.slice(secondBracketIndex + 1);
    }

    modifiedString = modifiedString.replace(', [', '. [');

    const [numStr, arrStr] = modifiedString.split('. ');
    const scamProbability = parseFloat(numStr);
    const keywordsArray = eval(arrStr);

    setScamProb(Math.round(scamProbability)); // Set scam probability
    setKeywords(keywordsArray); // Set keywords
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page

    try {
      // Send POST request with the required body format
      const res = await axios.post('http://localhost:5000/api/detect', {
        smsText: message, // Format the body with smsText as the key
      });

      setResponse(res.data); // Store the response data
    } catch (error) {
      console.error('Error:', error);
      setResponse({ error: 'Failed to detect scam message.' });
    }
  };

  // Only run getProb when response changes (and not on every render)
  useEffect(() => {
    if (response && response.result) {
      getProb(response.result); // Call getProb when response changes
    }
  }, [response]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>SMS Scam Detector</h1>
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Enter the SMS message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="5"
            cols="50"
            required
          ></textarea>
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
