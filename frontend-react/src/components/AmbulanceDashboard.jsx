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
        <h2>🚑 Ambulance Status</h2>
        <p>Current ambulance availability in Chandigarh</p>
        <div className="ambulance-cards">
          {ambulances.map((a) => (
            <div key={a.id} className={`ambulance-card ${a.busy ? 'busy' : 'available'}`}>
              <h3>{a.id}</h3>
              <p>📍 {a.location}</p>
              <span>{a.busy ? 'Busy' : 'Available'}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
