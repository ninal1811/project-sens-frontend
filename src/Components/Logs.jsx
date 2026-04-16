import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import './Logs.css';

const API_URL = import.meta.env.VITE_API_URL;
const DEVELOPER_EMAIL = import.meta.env.VITE_DEVELOPER_EMAIL;

export default function Logs() {
  const [logFiles, setLogFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [logContent, setLogContent] = useState(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const contentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const email = sessionStorage.getItem('email');
    const isLoggedIn = sessionStorage.getItem('loggedIn') === 'true';
    if (!isLoggedIn || email !== DEVELOPER_EMAIL) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    fetchLogFiles();
  }, []);

  // Auto-scroll to bottom when content loads
  useEffect(() => {
    if (logContent && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [logContent]);

  const fetchLogFiles = async () => {
    setIsLoadingFiles(true);
    setError(null);
    try {
      const devEmail = sessionStorage.getItem('email') || '';
      const { data } = await axios.get(`${API_URL}/dev/logs`, {
        withCredentials: true,
        headers: { 'X-Dev-Email': devEmail }
      });
      setLogFiles(data.log_files || []);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(`${status ? `[${status}] ` : ''}${msg || 'Failed to fetch log files'}`);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const fetchLogContent = async (filename) => {
    setIsLoadingContent(true);
    setError(null);
    setSelectedFile(filename);
    setLogContent(null);
    setFilter('');
    try {
      const devEmail = sessionStorage.getItem('email') || '';
      const { data } = await axios.get(`${API_URL}/dev/logs/${filename}`, {
        withCredentials: true,
        headers: { 'X-Dev-Email': devEmail }
      });
      setLogContent(data);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(`${status ? `[${status}] ` : ''}${msg || 'Failed to read log file'}`);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const filteredLines = logContent?.lines
    ? logContent.lines.filter(line =>
        filter ? line.toLowerCase().includes(filter.toLowerCase()) : true
      )
    : [];

  const getLineClass = (line) => {
    const lower = line.toLowerCase();
    if (lower.includes('error') || lower.includes('critical')) return 'log-line log-error';
    if (lower.includes('warn')) return 'log-line log-warn';
    if (lower.includes('info')) return 'log-line log-info';
    return 'log-line';
  };

  return (
    <div className="logs-page">
      <div className="logs-header">
        <div className="logs-header-left">
          <span className="logs-badge">DEV</span>
          <h1 className="logs-title">Server Logs</h1>
        </div>
        <button className="logs-refresh-btn" onClick={fetchLogFiles} disabled={isLoadingFiles}>
          {isLoadingFiles ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="logs-error">{error}</div>
      )}

      <div className="logs-layout">
        {/* File list sidebar */}
        <aside className="logs-sidebar">
          <h2 className="logs-sidebar-title">
            Log Files
            {logFiles.length > 0 && <span className="logs-count">{logFiles.length}</span>}
          </h2>
          {isLoadingFiles ? (
            <div className="logs-loading">Loading files...</div>
          ) : logFiles.length === 0 ? (
            <p className="logs-empty">No log files found.</p>
          ) : (
            <ul className="logs-file-list">
              {logFiles.map((filename) => (
                <li key={filename}>
                  <button
                    className={`logs-file-btn ${selectedFile === filename ? 'active' : ''}`}
                    onClick={() => fetchLogContent(filename)}
                  >
                    {filename}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Log content panel */}
        <main className="logs-content-panel">
          {!selectedFile ? (
            <div className="logs-placeholder">Select a log file to view its contents.</div>
          ) : isLoadingContent ? (
            <div className="logs-loading">Loading {selectedFile}...</div>
          ) : logContent ? (
            <>
              <div className="logs-content-header">
                <span className="logs-filename">{selectedFile}</span>
                <span className="logs-meta">
                  Showing {filteredLines.length} of {logContent.total_lines} lines
                </span>
                <input
                  type="text"
                  placeholder="Filter lines..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="logs-filter-input"
                />
              </div>
              <div className="logs-content" ref={contentRef}>
                {filteredLines.length === 0 ? (
                  <p className="logs-empty">No lines match the filter.</p>
                ) : (
                  filteredLines.map((line, idx) => (
                    <div key={idx} className={getLineClass(line)}>
                      <span className="log-line-num">{idx + 1}</span>
                      <span className="log-line-text">{line}</span>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
