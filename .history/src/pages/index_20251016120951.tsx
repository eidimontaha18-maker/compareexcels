import React from 'react';
import './index.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to your project dashboard</p>
      </header>
      
      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Quick Stats</h3>
            <div className="stat-item">
              <span className="stat-label">Projects:</span>
              <span className="stat-value">12</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tasks:</span>
              <span className="stat-value">24</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completed:</span>
              <span className="stat-value">18</span>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h3>Recent Activity</h3>
            <ul className="activity-list">
              <li>Project setup completed</li>
              <li>Dashboard page created</li>
              <li>Components initialized</li>
            </ul>
          </div>
          
          <div className="dashboard-card">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn primary">Create New Project</button>
              <button className="action-btn secondary">View Reports</button>
              <button className="action-btn secondary">Settings</button>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h3>System Status</h3>
            <div className="status-item">
              <span className="status-indicator green"></span>
              <span>All systems operational</span>
            </div>
            <div className="status-item">
              <span className="status-indicator green"></span>
              <span>Database connected</span>
            </div>
            <div className="status-item">
              <span className="status-indicator yellow"></span>
              <span>Updates available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;