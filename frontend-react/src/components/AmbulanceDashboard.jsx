import { useEffect, useState } from 'react';

const STATIC_AMBULANCES = [
  { id: 'A101', location: 'Sector 17', busy: false },
  { id: 'A102', location: 'Sector 22', busy: false },
  { id: 'A103', location: 'Sector 34', busy: true },
  { id: 'A104', location: 'Sector 16', busy: false },
  { id: 'A105', location: 'Sector 32', busy: false },
];

export default function AmbulanceDashboard() {
  const [ambulances, setAmbulances] = useState(STATIC_AMBULANCES);

  useEffect(() => {
    fetch('http://localhost:3000/api/ambulances')
      .then((res) => res.json())
      .then((data) => {
        setAmbulances(
          data.map((a) => ({ id: a.ambulance_id, location: a.location, busy: a.status !== 'Available' }))
        );
      })
      .catch(() => {}); // fallback to static data on error
  }, []);

  return (
    <section id="ambulances" className="ambulance-dashboard">
      <div className="dashboard-container">
        <div className="section-heading">
          <span className="section-overline">FLEET TELEMETRY</span>
          <h2>Ambulance Fleet Status</h2>
          <p>Live telemetry and availability monitoring across Chandigarh sectors</p>
        </div>
        <div className="ambulance-cards">
          {ambulances.map((a) => (
            <div key={a.id} className={`ambulance-card ${a.busy ? 'busy' : 'available'}`}>
              <div className="ambulance-card-header">
                <span className="ambulance-id">{a.id}</span>
                <span className={`status-pill ${a.busy ? 'busy' : 'available'}`}>
                  <span className="status-dot" />
                  {a.busy ? 'Busy' : 'Available'}
                </span>
              </div>
              <div className="ambulance-card-body">
                <span className="location-label">Station Base</span>
                <p className="location-text">📍 {a.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
