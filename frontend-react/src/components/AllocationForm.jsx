import { useState } from 'react';

export default function AllocationForm() {
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('');
  const [hospital, setHospital] = useState('');
  const [result, setResult] = useState(null);

  function requestAmbulance() {
    if (!location || !priority || !hospital) {
      setResult({ type: 'error', message: 'Please select patient sector, emergency priority, and destination hospital.' });
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
          setResult({ type: 'error', message: data.message });
        }
      })
      .catch(() => {
        setResult({ type: 'error', message: 'Could not connect to the backend server (http://localhost:3000). Please ensure server is running.' });
      });
  }

  function resetAmbulances() {
    fetch('http://localhost:3000/api/reset', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setResult({ type: 'success', message: data.message });
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setResult({ type: 'error', message: data.error });
        }
      })
      .catch(() => setResult({ type: 'error', message: 'Could not reach the backend server to reset fleet status.' }));
  }

  return (
    <>
      <section id="allocation" className="allocation-section">
        <div className="allocation-container">
          <div className="section-heading">
            <span className="section-overline">DISPATCH REQUEST</span>
            <h2>Request Emergency Ambulance</h2>
            <p>Specify patient triage details to trigger Dijkstra shortest-path allocation</p>
          </div>

          <div className="allocation-card">
            <form className="request-form" onSubmit={(e) => e.preventDefault()}>
              <div className="input-field">
                <label htmlFor="patientLocation">Patient Sector Location</label>
                <select
                  id="patientLocation"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="">Select Chandigarh Sector</option>
                  <option value="Sector 16">Sector 16</option>
                  <option value="Sector 17">Sector 17</option>
                  <option value="Sector 22">Sector 22</option>
                  <option value="Sector 32">Sector 32</option>
                  <option value="Sector 34">Sector 34</option>
                </select>
              </div>

              <div className="input-field">
                <label htmlFor="priority">Triage Priority Level</label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="">Select Priority Level</option>
                  <option value="Critical">Critical (Immediate Response)</option>
                  <option value="High">High (Urgent Medical Care)</option>
                  <option value="Normal">Normal (Standard Dispatch)</option>
                </select>
              </div>

              <div className="input-field">
                <label htmlFor="hospital">Destination Hospital</label>
                <select
                  id="hospital"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                >
                  <option value="">Select Designated Hospital</option>
                  <option value="GMSH Sector 16">GMSH Sector 16</option>
                  <option value="GMCH Sector 32">GMCH Sector 32</option>
                  <option value="PGIMER">PGIMER Chandigarh</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-primary" onClick={requestAmbulance}>
                  Find &amp; Dispatch Ambulance
                </button>
                <button
                  type="button"
                  className="btn-destructive"
                  onClick={resetAmbulances}
                >
                  Reset Fleet
                </button>
              </div>

              {result && (
                <div className={`form-message ${result.type}`}>
                  <span>{result.type === 'error' ? '⚠️' : '✓'}</span>
                  <span>{result.message}</span>
                </div>
              )}

              <div id="allocationResult" />
            </form>
          </div>
        </div>
      </section>

      <footer>
        <p>© 2026 Emergency Ambulance Allocation System · Genesis Precision Interface</p>
        <p style={{ color: 'var(--color-neutral)', fontSize: '12px' }}>
          Dijkstra Shortest Path Routing · Job Sequencing with Deadlines
        </p>
      </footer>
    </>
  );
}
