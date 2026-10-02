export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <div className="badge">
          <span className="badge-dot" style={{ backgroundColor: 'var(--color-success)' }} />
          Live Emergency Dispatch Active
        </div>
        <h1>
          Emergency Ambulance <span>Allocation System</span>
        </h1>
        <p className="hero-text">
          Precision triage, shortest-path calculation, and prioritized fleet dispatch for Chandigarh emergency medical services.
        </p>
        <div className="hero-buttons">
          <a href="#allocation" className="btn-primary">
            Request Ambulance
          </a>
          <a href="#ambulances" className="btn-secondary">
            Explore Fleet
          </a>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-frame-card">
          <div className="frame-card-header">
            <span className="frame-card-tag">SYSTEM TELEMETRY</span>
            <span className="frame-card-status">Online</span>
          </div>
          <div className="frame-card-body">
            <div className="frame-card-hero-icon">🚑</div>
            <div className="frame-stat-row">
              <span className="stat-label">Coverage Region</span>
              <span className="stat-value">Chandigarh Tri-City</span>
            </div>
            <div className="frame-stat-row">
              <span className="stat-label">Routing Engine</span>
              <span className="stat-value">Dijkstra Graph</span>
            </div>
            <div className="frame-stat-row">
              <span className="stat-label">Priority Logic</span>
              <span className="stat-value">Greedy Sequencing</span>
            </div>
            <div className="frame-stat-row">
              <span className="stat-label">Average Response</span>
              <span className="stat-value">&lt; 8 mins</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
