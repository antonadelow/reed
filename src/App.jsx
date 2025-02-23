import React, { useState, useEffect } from 'react';
import './App.css';
import { FaSearch } from 'react-icons/fa';


function App() {
  const [papers, setPapers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);

  useEffect(() => {
    // Gradient and overlay are now handled in CSS
  }, []);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://export.arxiv.org/api/query?search_query=ti:${searchQuery} OR abs:${searchQuery}&start=0&max_results=10&sortBy=relevance&sortOrder=descending`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const entries = Array.from(xmlDoc.querySelectorAll('entry'));
      const paperData = entries.map((entry) => {
        const title = entry.querySelector('title').textContent;
        const authors = Array.from(entry.querySelectorAll('author name')).map(
          (name) => name.textContent
        ).join(', ');
        const link = entry.querySelector('id').textContent;
        const summary = entry.querySelector('summary').textContent;
        return { title, authors, link, summary };
      });
      setPapers(paperData);
      setSelectedPaper(null);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchPapers();
  };

  const handlePaperClick = (paper) => {
    setSelectedPaper(paper);
  };

  const handleBackToSearch = () => {
    setSelectedPaper(null);
  };

    const handleSearchLinkClick = (event) => {
    event.preventDefault(); // Prevent default link behavior
    // Scroll to the search form
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
      searchForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="app-container">
      <div className="top-bar">
        <span className="site-name">R<span className="smaller-e">eed</span></span>
        <div className="nav-links">
          <a href="#" onClick={handleSearchLinkClick} className="nav-link">
            Search <FaSearch className="search-icon" />
          </a>
          <a href="#" className="nav-link">Feed</a>
          <a href="#" className="nav-link">Explore</a>
        </div>
      </div>
      <div className="content-area">
        <h2 className="search-heading">Search for a paper</h2>
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            className="search-input"
            type="text"
            placeholder="Enter search query..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button className="search-button" type="submit">Search</button>
        </form>
        {loading && <p className="loading-text">Loading papers...</p>}
        {!selectedPaper ? (
          <ul className="papers-list">
            {papers.map((paper, index) => (
              <li key={index} className="paper-item" onClick={() => handlePaperClick(paper)}>
                <h2 className="paper-title">
                  {paper.title}
                </h2>
                <p className="paper-authors">Authors: {paper.authors}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="paper-details">
            <button className="back-button" onClick={handleBackToSearch}>Back to Search</button>
            <h2 className="paper-title">{selectedPaper.title}</h2>
            <p className="paper-authors">Authors: {selectedPaper.authors}</p>
            <p className="paper-summary">Summary: {selectedPaper.summary}</p>
            <a href={selectedPaper.link} target="_blank" rel="noopener noreferrer" className="paper-link">
              View Paper on Arxiv
            </a>
          </div>
        )}
      </div>
      {/* Dark overlay */}
      <div className="dark-overlay"></div>
    </div>
  );
}

export default App;
