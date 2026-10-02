import { useState } from 'react';

export default function AllocationForm() {
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('');
  const [hospital, setHospital] = useState('');
  const [result, setResult] = useState(null);

  function requestAmbulance() {
    if (!location || !priority || !hospital) {
      setResult({ type: 'error', message: '⚠️ Please select all details.' });
      return;
    }

    const resultEl = document.getElementById('allocationResult');

    fetch('http://localhost:3000/api/allocate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sector: location, priority, hospital }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (window.allocateAmbulanceOnMap) {
            window.allocateAmbulanceOnMap(location, hospital, priority, resultEl, data.allocatedAmbulance.ambulance_id);
          }
          setResult(null); // map section renders result directly into resultEl
        } else {
          setResult({ type: 'error', message: `❌ ${data.message}` });
        }
      })
      .catch(() => {
        setResult({ type: 'error', message: '❌ Could not reach the backend server. Is it running?' });
      });
  }

  function resetAmbulances() {
    fetch('http://localhost:3000/api/reset', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setResult({ type: 'success', message: `✅ ${data.message}` });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setResult({ type: 'error', message: `❌ ${data.error}` });
        }
      })
      .catch(() => setResult({ type: 'error', message: '❌ Could not reach the backend server.' }));
  }

  return (
    <footer>
      <section id="allocation" className="allocation-section">
        <div className="allocation-container">
          <h2>🚑 Request an Ambulance</h2>
          <p>Select the emergency details below.</p>

          <div className="request-form">
            <label htmlFor="patientLocation">Patient Location</label>
            <select id="patientLocation" value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">Select Chandigarh Sector</option>
              <option value="Sector 16">Sector 16</option>
              <option value="Sector 17">Sector 17</option>
              <option value="Sector 22">Sector 22</option>
              <option value="Sector 32">Sector 32</option>
              <option value="Sector 34">Sector 34</option>
            </select>

            <label htmlFor="priority">Emergency Priority</label>
            <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="">Select Priority</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
            </select>

            <label htmlFor="hospital">Hospital</label>
            <select id="hospital" value={hospital} onChange={(e) => setHospital(e.target.value)}>
              <option value="">Select Hospital</option>
              <option value="GMSH Sector 16">GMSH Sector 16</option>
              <option value="GMCH Sector 32">GMCH Sector 32</option>
              <option value="PGIMER">PGIMER</option>
            </select>

            <button type="button" className="btn-primary" onClick={requestAmbulance}>
              🚑 Find Ambulance
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={resetAmbulances}
              style={{ marginLeft: '10px', padding: '12px 24px', background: '#e23744', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🔄 Reset All
            </button>

            {result && (
              <p style={{ color: result.type === 'error' ? 'red' : 'green', marginTop: '10px' }}>
                {result.message}
              </p>
            )}
            <div id="allocationResult" />
          </div>
        </div>
      </section>
      <p>© 2026 Emergency Ambulance Allocation System</p>
    </footer>
  );
}
