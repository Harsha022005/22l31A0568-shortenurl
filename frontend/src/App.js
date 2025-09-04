import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; 

function App() {
  const [urls, setUrls] = useState([]);
  const [inputurl, setInputurl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all URLs
  const fetchUrls = async () => {
    try {
      const response = await axios.get('http://localhost:5000/shorten/fetchall');
      setUrls(response.data);
    } catch (err) {
      setError("Failed to fetch URLs");
    }
  };

  useEffect(() => {
    fetchUrls();
    window.addEventListener('focus', fetchUrls);
    return () => {
      window.removeEventListener('focus', fetchUrls);
    };
  }, []);

  const handleinputurl = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post('http://localhost:5000/shorten', {
        originalurl: inputurl
      });
      setUrls(prev => [...prev, response.data]);
      setInputurl("");
    } catch (err) {
      setError("Failed to shorten URL");
    }
    setLoading(false);
  };

  const handleNavigate = async (urlId, shorturl) => {
    try {
      await axios.put(`http://localhost:5000/shorten/increment/${urlId}`);
      setUrls(prevUrls =>
        prevUrls.map(url =>
          url.shorturl.endsWith(urlId)
            ? { ...url, clicks: (url.clicks ?? 0) + 1 }
            : url
        )
      );
      window.open(shorturl, "_blank");
      fetchUrls();
    } catch (err) {
      setError("Failed to navigate or URL expired");
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">URL Shortener</h1>

      
      <form className="url-form" onSubmit={handleinputurl}>
        <input
          type="text"
          className="url-input"
          placeholder="Enter your URL..."
          value={inputurl}
          onChange={(e) => setInputurl(e.target.value)}
        />
        <button className="shorten-btn" type="submit" disabled={loading}>
          {loading ? "Shortening..." : "Shorten"}
        </button>
      </form>

      {error && <div className="error-msg">{error}</div>}

      {/*Fetch all urls*/}
      <div className="url-list">
        {urls.map((url, index) => (
          <div key={index} className="url-card">
            <p>
              <strong>Original URL:</strong>{" "}
              <a href={url.originalurl} target="_blank" rel="noopener noreferrer">
                {url.originalurl}
              </a>
            </p>

            <p>
              <strong>Shortened URL:</strong>{" "}
              <a
                href={url.shorturl}
                target="_blank"
                rel="noopener noreferrer"
                className="short-url"
              >
                {url.shorturl}
              </a>
            </p>

            <p><strong>Clicks:</strong> {url.clicks ?? 0}</p>
            <p><strong>Created At:</strong> {new Date(url.createdAt).toLocaleString()}</p>
            <p><strong>Expires At:</strong> {new Date(url.expireAt).toLocaleString()}</p>

            <button
              className="navigate-btn"
              onClick={() => handleNavigate(url.shorturl.split('/').pop(), url.originalurl)}
            >
              Open Link
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
