import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import config from './config';

function App() {
  // State for form inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('all');
  const [darkMode, setDarkMode] = useState(false);

  // State for sources (checkboxes)
  const [sources, setSources] = useState({
    linkedin: true,
    wellfound: true,
    unstop: true
  });

  // State for results and loading
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableSources, setAvailableSources] = useState([]);

  // Effect to handle theme changes
  useEffect(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(savedTheme === 'true');
    } else {
      // Check for system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  // Apply theme class to body when dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Fetch available sources when component mounts
  useEffect(() => {
    axios.get(`${config.API_URL}/jobs/sources`)
      .then(response => {
        if (response.data.success) {
          const sourcesObj = {};
          response.data.data.forEach(source => {
            sourcesObj[source] = true;
          });
          setSources(sourcesObj);
          setAvailableSources(response.data.data);
        }
      })
      .catch(err => {
        console.error('Error fetching sources:', err);
      });
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    // Get selected sources
    const selectedSources = Object.keys(sources).filter(key => sources[key]);

    if (selectedSources.length === 0) {
      setError('Please select at least one source');
      return;
    }

    setLoading(true);
    setError(null);
    setJobs([]);

    try {
      const response = await axios.post(`${config.API_URL}/jobs/scrape`, {
        searchQuery,
        location: location.trim() || undefined,
        jobType: jobType === 'all' ? undefined : jobType,
        sources: selectedSources
      });

      if (response.data.success) {
        setJobs(response.data.data);
      } else {
        setError(response.data.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError('Error connecting to server. Please try again.');
      console.error('API error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle source checkbox changes
  const handleSourceChange = (source) => {
    setSources(prevSources => ({
      ...prevSources,
      [source]: !prevSources[source]
    }));
  };

  // Export results to CSV
  const exportToCsv = () => {
    if (!jobs.length) return;

    const headers = ['Title', 'Company', 'Location', 'Posted', 'Source', 'Link'];
    let csvContent = headers.join(',') + '\n';

    jobs.forEach(job => {
      const row = [
        formatForCsv(job.title),
        formatForCsv(job.company),
        formatForCsv(job.location),
        formatForCsv(job.posted),
        formatForCsv(job.source),
        formatForCsv(job.link || '')
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jobs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function for CSV formatting
  const formatForCsv = (text) => {
    if (!text) return '';
    const escaped = String(text).replace(/"/g, '""');
    return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-theme' : ''}`}>
      <header className="app-header">
        <div className="theme-toggle">
          <button
            onClick={toggleDarkMode}
            className="theme-toggle-button"
            aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        <h1>Job Aggregator</h1>
        <p>Search for jobs across LinkedIn, Wellfound, and Unstop</p>
      </header>

      <main className="app-main">
        <section className="search-section">
          <div className="card">
            <h2>Search Jobs</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="searchQuery">Job Title / Keywords</label>
                <input
                  type="text"
                  id="searchQuery"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. New York"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="jobType">Job Type</label>
                  <select
                    id="jobType"
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                  >
                    <option value="all">All Job Types</option>
                    <option value="internship">Internships</option>
                    <option value="fulltime">Full-time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Sources</label>
                <div className="sources-grid">
                  {availableSources.map(source => (
                    <div className="source-checkbox" key={source}>
                      <input
                        type="checkbox"
                        id={`source-${source}`}
                        checked={sources[source] || false}
                        onChange={() => handleSourceChange(source)}
                      />
                      <label htmlFor={`source-${source}`}>{source.charAt(0).toUpperCase() + source.slice(1)}</label>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="search-button"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search Jobs'}
              </button>
            </form>
          </div>
        </section>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Searching for jobs across multiple platforms...<br />This may take a minute</p>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <section className="results-section">
            <div className="results-header">
              <h2>Found {jobs.length} Jobs</h2>
              <button onClick={exportToCsv} className="export-button">
                Export CSV
              </button>
            </div>

            <div className="table-container">
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Posted</th>
                    <th>Source</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, index) => (
                    <tr key={index}>
                      <td className="job-title">{job.title}</td>
                      <td>{job.company}</td>
                      <td>{job.location}</td>
                      <td>{job.posted}</td>
                      <td>
                        <span className={`source-badge source-${job.source.toLowerCase()}`}>
                          {job.source}
                        </span>
                      </td>
                      <td>
                        {job.link ? (
                          <a
                            href={job.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-button"
                          >
                            View
                          </a>
                        ) : (
                          <span className="no-link">No link</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {!loading && jobs.length === 0 && searchQuery && (
          <div className="no-results">
            <h3>No jobs found</h3>
            <p>Try adjusting your search criteria or selecting different sources.</p>
          </div>
        )}

        <section className="info-section">
          <div className="card">
            <h3>About This Tool</h3>
            <ul>
              <li>This aggregator searches across LinkedIn, Wellfound, and Unstop for job listings</li>
              <li>Results are cached for 30 minutes to improve performance</li>
              <li>For best results, use specific keywords in your search</li>
              <li>Location filters are optional but help narrow down results</li>
              <li>This tool is for educational purposes only</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>Job Aggregator &copy; {new Date().getFullYear()} • Not affiliated with LinkedIn, Wellfound, or Unstop.</p>
      </footer>
    </div>
  );
}

export default App;
