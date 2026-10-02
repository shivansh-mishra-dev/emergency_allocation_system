const HOSPITALS = [
  { name: 'GMSH Sector 16', location: 'Sector 16, Chandigarh', badge: '24×7 Trauma Care' },
  { name: 'GMCH Sector 32', location: 'Sector 32, Chandigarh', badge: '24×7 Multi-Specialty' },
  { name: 'PGIMER', location: 'Sector 12, Chandigarh', badge: 'Advanced Emergency Center' },
];

export default function Hospitals() {
  return (
    <section id="hospitals" className="hospital-section">
      <div className="hospital-container">
        <div className="section-heading">
          <span className="section-overline">NETWORKED CENTERS</span>
          <h2>Designated Emergency Hospitals</h2>
          <p>Designated regional trauma centers and specialty emergency facilities</p>
        </div>
        <div className="hospital-cards">
          {HOSPITALS.map((h) => (
            <div className="hospital-card" key={h.name}>
              <div className="hospital-card-top">
                <div className="hospital-icon">🏥</div>
                <span className="hospital-badge">{h.badge}</span>
              </div>
              <h3>{h.name}</h3>
              <p className="hospital-loc">📍 {h.location}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
