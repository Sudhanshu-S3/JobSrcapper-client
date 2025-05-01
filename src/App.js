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

  // State for results and loading
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage, setJobsPerPage] = useState(10);

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

  // Reset pagination when jobs change
  useEffect(() => {
    setCurrentPage(1);
  }, [jobs]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setJobs([]);
    setCurrentPage(1); // Reset to first page on new search

    try {
      const response = await axios.post(`${config.API_URL}/jobs/scrape`, {
        searchQuery,
        location: location.trim() || undefined,
        jobType: jobType === 'all' ? undefined : jobType,
        sources: ['linkedin'] // Only use LinkedIn
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

  // Get current page items
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  // Change page
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Scroll back to top of results
      const resultsSection = document.querySelector('.results-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Handle change in jobs per page
  const handleJobsPerPageChange = (e) => {
    setJobsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Export results to CSV
  const exportToCsv = () => {
    if (!jobs.length) return;

    const headers = ['Title', 'Company', 'Location', 'Posted', 'Link'];
    let csvContent = headers.join(',') + '\n';

    jobs.forEach(job => {
      const row = [
        formatForCsv(job.title),
        formatForCsv(job.company),
        formatForCsv(job.location),
        formatForCsv(job.posted),
        formatForCsv(job.link || '')
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `linkedin_jobs_${new Date().toISOString().slice(0, 10)}.csv`);
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

  // Render pagination controls
  const renderPagination = () => {
    if (jobs.length === 0) return null;

    return (
      <div className="pagination-container">
        <div className="pagination-controls">
          <button
            onClick={() => paginate(currentPage - 1)}
            className="pagination-button"
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <div className="pagination-pages">
            {renderPageNumbers()}
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            className="pagination-button"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        <div className="pagination-info">
          <span>
            Page {currentPage} of {totalPages || 1}
          </span>

          <div className="jobs-per-page">
            <label htmlFor="jobsPerPage">Show:</label>
            <select
              id="jobsPerPage"
              value={jobsPerPage}
              onChange={handleJobsPerPageChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>per page</span>
          </div>
        </div>
      </div>
    );
  };

  // Render page number buttons
  const renderPageNumbers = () => {
    const pageNumbers = [];

    // Show max 5 page numbers
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    // First page button
    if (startPage > 1) {
      pageNumbers.push(
        <button key="1" onClick={() => paginate(1)} className="pagination-page-button">
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`pagination-page-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Last page button
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => paginate(totalPages)}
          className="pagination-page-button"
        >
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
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
        <h1>LinkedIn Job Aggregator</h1>
        <p>Search for jobs on LinkedIn</p>
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
                {loading ? 'Searching...' : 'Search LinkedIn Jobs'}
              </button>
            </form>
          </div>
        </section>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Searching for jobs on LinkedIn...<br />This may take a minute</p>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <section className="results-section">
            <div className="results-header">
              <h2>Found {jobs.length} Jobs <small style={{ fontWeight: 'normal', fontSize: '0.8em' }}>(sorted by date)</small></h2>
              <button onClick={exportToCsv} className="export-button">
                Export CSV
              </button>
            </div>

            {/* Pagination Controls - Top */}
            {renderPagination()}

            <div className="table-container">
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Posted</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentJobs.map((job, index) => (
                    <tr key={index}>
                      <td className="job-title">{job.title}</td>
                      <td>{job.company}</td>
                      <td>{job.location}</td>
                      <td>{job.posted}</td>
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

            {/* Pagination Controls - Bottom */}
            {renderPagination()}
          </section>
        )}

        {!loading && jobs.length === 0 && searchQuery && (
          <div className="no-results">
            <h3>No jobs found</h3>
            <p>Try adjusting your search criteria.</p>
          </div>
        )}

        <section className="info-section">
          <div className="card">
            <h3>About This Tool</h3>
            <ul>
              <li>This tool searches LinkedIn for job listings</li>
              <li>Results are cached for 30 minutes to improve performance</li>
              <li>For best results, use specific keywords in your search</li>
              <li>Location filters are optional but help narrow down results</li>
              <li>This tool is for educational purposes only</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>LinkedIn Job Aggregator &copy; {new Date().getFullYear()} • Not affiliated with LinkedIn.</p>
      </footer>
    </div>
  );
}

export default App;
