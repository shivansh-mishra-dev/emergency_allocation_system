export default function Features() {
  const features = [
    {
      icon: '📍',
      title: 'Fast Allocation',
      desc: 'Rapidly identifies and assigns the nearest available fleet unit to incoming requests.',
      badge: 'Real-time',
    },
    {
      icon: '🗺️',
      title: 'Shortest Route',
      desc: 'Computes optimal pathing using Dijkstra algorithm on Chandigarh road networks.',
      badge: 'Dijkstra',
    },
    {
      icon: '⚡',
      title: 'Priority Handling',
      desc: 'Schedules critical emergency calls with deadline-constrained greedy job sequencing.',
      badge: 'Sequencing',
    },
  ];

  return (
    <section className="features">
      <div className="section-container">
        <div className="section-heading">
          <span className="section-overline">CAPABILITIES</span>
          <h2>Smart Emergency Response</h2>
          <p>
            Autonomous dispatch system engineered for zero-latency triage and optimal routing.
          </p>
        </div>
        <div className="feature-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-card-top">
                <div className="feature-icon">{f.icon}</div>
                <span className="feature-chip">{f.badge}</span>
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
