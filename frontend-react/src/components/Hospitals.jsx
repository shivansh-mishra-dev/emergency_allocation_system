const HOSPITALS = [
  { name: 'GMSH Sector 16', location: 'Sector 16, Chandigarh', badge: '24×7 Emergency' },
  { name: 'GMCH Sector 32', location: 'Sector 32, Chandigarh', badge: '24×7 Emergency' },
  { name: 'PGIMER', location: 'Sector 12, Chandigarh', badge: 'Emergency Services' },
];

export default function Hospitals() {
  return (
    <section id="hospitals" className="hospital-section">
      <div className="hospital-container">
        <h2>🏥 Emergency Hospitals</h2>
        <p>Emergency hospitals available in Chandigarh</p>
        <div className="hospital-cards">
          {HOSPITALS.map((h) => (
            <div className="hospital-card" key={h.name}>
              <h3>🏥 {h.name}</h3>
              <p>📍 {h.location}</p>
              <span>{h.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
