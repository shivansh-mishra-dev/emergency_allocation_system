export default function Features() {
  const features = [
    { icon: '📍', title: 'Fast Allocation', desc: 'Quickly identify and assign the nearest available ambulance.' },
    { icon: '🗺️', title: 'Shortest Route', desc: 'Find efficient routes using shortest-path algorithms.' },
    { icon: '⚡', title: 'Priority Handling', desc: 'Handle critical emergency requests according to their priority.' },
  ];

  return (
    <section className="features">
      <h2>Smart Emergency Response</h2>
      <p className="section-text">
        Our system helps allocate ambulances efficiently using intelligent algorithms.
      </p>
      <div className="feature-container">
        {features.map((f) => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
