import { useEffect, useRef } from 'react';

const AMBULANCES = [
  { id: 'A101', lat: 30.7420, lng: 76.8000, busy: false },
  { id: 'A102', lat: 30.7480, lng: 76.7700, busy: false },
  { id: 'A103', lat: 30.7300, lng: 76.7900, busy: true },
  { id: 'A104', lat: 30.7550, lng: 76.8000, busy: false },
  { id: 'A105', lat: 30.7100, lng: 76.7900, busy: false },
];

const HOSPITALS = [
  { name: 'PGIMER',       lat: 30.7649, lng: 76.7760 },
  { name: 'GMCH 32',      lat: 30.7143, lng: 76.7745 },
  { name: 'GMSH 16',      lat: 30.7470, lng: 76.7830 },
  { name: 'Fortis Mohali',lat: 30.6967, lng: 76.7256 },
];

const SPEED = 40; // km/h

function dist(a, b) {
  const R = 6371, r = (d) => (d * Math.PI) / 180;
  const h =
    Math.sin(r(b.lat - a.lat) / 2) ** 2 +
    Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const nearest = (list, p) =>
  list.reduce((best, x) => {
    const d = dist(x, p);
    return !best || d < best.d ? { item: x, d } : best;
  }, null);

export default function MapSection() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.L) return;
    const L = window.L;

    const ambulances = AMBULANCES.map((a) => ({ ...a }));
    const icon = (cls, t) =>
      L.divIcon({
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        html: `<div class="pin ${cls}">${t}</div>`,
      });

    const map = L.map(mapRef.current).setView([30.7333, 76.7794], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    ambulances.forEach((a) => {
      a.marker = L.marker([a.lat, a.lng], { icon: icon(a.busy ? 'busy' : 'ok', 'A') }).addTo(map);
      a.marker.bindTooltip(a.id, { permanent: true, direction: 'right', offset: [12, 0] });
      a.marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        a.busy = !a.busy;
        refresh();
      });
    });

    HOSPITALS.forEach((h) => {
      L.marker([h.lat, h.lng], { icon: icon('hosp', 'H') })
        .addTo(map)
        .bindTooltip(h.name, { permanent: true, direction: 'right', offset: [12, 0] });
    });

    let patient = null, pMarker = null, route = null;

    const $ = (id) => document.getElementById(id);

    async function refresh() {
      ambulances.forEach((a) => a.marker.setIcon(icon(a.busy ? 'busy' : 'ok', 'A')));
      $('cOk').textContent = ambulances.filter((a) => !a.busy).length;
      $('cBusy').textContent = ambulances.filter((a) => a.busy).length;
      $('cHosp').textContent = HOSPITALS.length;
      $('cPat').textContent = patient ? 1 : 0;
      if (route) { map.removeLayer(route); route = null; }

      if (!patient) {
        $('qAmb').textContent = 'Click on the map';
        $('qHosp').textContent = '-';
        $('qEta').textContent = '-';
        return;
      }

      const amb = nearest(ambulances.filter((a) => !a.busy), patient);
      const hos = nearest(HOSPITALS, patient);
      $('qHosp').textContent = `${hos.item.name} (${hos.d.toFixed(1)} km)`;
      if (!amb) { $('qAmb').textContent = 'No ambulance available'; $('qEta').textContent = '-'; return; }

      let km = amb.d;
      let path = [[amb.item.lat, amb.item.lng], [patient.lat, patient.lng]];
      try {
        const u = `https://router.project-osrm.org/route/v1/driving/${amb.item.lng},${amb.item.lat};${patient.lng},${patient.lat}?overview=full&geometries=geojson`;
        const r = await (await fetch(u)).json();
        if (r.routes?.[0]) {
          km = r.routes[0].distance / 1000;
          path = r.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
        }
      } catch {
        // Fallback to straight line
      }

      route = L.polyline(path, { color: '#6366F1', weight: 4 }).addTo(map);
      $('qAmb').textContent = `${amb.item.id} (${km.toFixed(1)} km)`;
      $('qEta').textContent = `${Math.max(1, Math.round((km / SPEED) * 60))} min`;
    }

    refresh();

    map.on('click', (e) => {
      patient = { lat: e.latlng.lat, lng: e.latlng.lng };
      if (pMarker) pMarker.setLatLng(e.latlng);
      else pMarker = L.marker(e.latlng, { icon: icon('pat', 'P') }).addTo(map);
      refresh();
    });

    document.getElementById('reset-patient').onclick = () => {
      patient = null;
      if (pMarker) { map.removeLayer(pMarker); pMarker = null; }
      refresh();
    };

    // Expose allocate function for AllocationForm to call
    window.allocateAmbulanceOnMap = async (sectorName, hospitalName, priority, resultEl, allocatedId) => {
      const sectorCoords = {
        'Sector 16': { lat: 30.7470, lng: 76.7830 },
        'Sector 17': { lat: 30.7420, lng: 76.8000 },
        'Sector 22': { lat: 30.7350, lng: 76.7750 },
        'Sector 32': { lat: 30.7143, lng: 76.7745 },
        'Sector 34': { lat: 30.7200, lng: 76.7650 },
      };
      const coords = sectorCoords[sectorName];
      if (!coords) return;

      patient = coords;
      if (pMarker) pMarker.setLatLng(patient);
      else pMarker = L.marker(patient, { icon: icon('pat', 'P') }).addTo(map);

      const specificAmb = ambulances.find((a) => a.id === allocatedId);
      if (!specificAmb) {
        resultEl.innerHTML = `<p style="color:var(--color-error); font-size:13px; margin-top:12px;">❌ Ambulance not found on map.</p>`;
        return;
      }

      specificAmb.busy = true;
      specificAmb.marker.setIcon(icon('busy', 'A'));
      $('cOk').textContent = ambulances.filter((a) => !a.busy).length;
      $('cBusy').textContent = ambulances.filter((a) => a.busy).length;
      $('cPat').textContent = '1';
      $('qHosp').textContent = hospitalName;

      let km = dist(specificAmb, patient);
      let path = [[specificAmb.lat, specificAmb.lng], [patient.lat, patient.lng]];
      try {
        const u = `https://router.project-osrm.org/route/v1/driving/${specificAmb.lng},${specificAmb.lat};${patient.lng},${patient.lat}?overview=full&geometries=geojson`;
        const r = await (await fetch(u)).json();
        if (r.routes?.[0]) {
          km = r.routes[0].distance / 1000;
          path = r.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
        }
      } catch {
        // Fallback to straight line
      }

      if (route) map.removeLayer(route);
      route = L.polyline(path, { color: '#6366F1', weight: 4 }).addTo(map);
      $('qAmb').textContent = `${specificAmb.id} (${km.toFixed(1)} km)`;
      $('qEta').textContent = `${Math.max(1, Math.round((km / 40) * 60))} min`;

      resultEl.innerHTML = `
        <div class="allocation-result">
          <h3>Ambulance Assigned</h3>
          <p><strong>Fleet Unit:</strong> <code style="font-family:var(--font-code); color:var(--color-primary);">${specificAmb.id}</code></p>
          <p><strong>Triage Priority:</strong> ${priority}</p>
          <p><strong>Destination:</strong> ${hospitalName}</p>
          <p><strong>Route Distance:</strong> ${km.toFixed(1)} km</p>
          <p><strong>Dispatch Status:</strong> <span class="status-pill busy"><span class="status-dot"></span>En Route</span></p>
        </div>`;

      map.setView(patient, 14);
    };

    return () => {
      map.remove();
      window.allocateAmbulanceOnMap = null;
    };
  }, []);

  return (
    <section id="map-section" className="map-section">
      <div className="map-container">
        <div className="map-heading">
          <div>
            <span className="section-overline">GEOSPATIAL DISPATCH</span>
            <h2>Chandigarh Emergency Grid</h2>
            <p>Live GPS positioning for active ambulances, medical centers, and incident reports</p>
          </div>
          <div className="map-status">
            <span className="status-dot" style={{ backgroundColor: 'var(--color-success)' }} />
            Telemetry Online
          </div>
        </div>

        <div className="em-layout">
          <div ref={mapRef} id="map" style={{ height: '540px' }} />
          <aside className="em-side">
            <h3>Fleet Telemetry</h3>
            <div className="em-row"><span>Available Ambulances</span><b id="cOk">0</b></div>
            <div className="em-row"><span>Engaged / Busy</span><b id="cBusy">0</b></div>
            <div className="em-row"><span>Hospital Centers</span><b id="cHosp">0</b></div>
            <div className="em-row"><span>Active Incidents</span><b id="cPat">0</b></div>
            <div className="em-quick">
              <strong>Shortest Path Estimate</strong>
              <p><small>Nearest Unit</small><span id="qAmb">Click on the map</span></p>
              <p><small>Nearest Center</small><span id="qHosp">-</span></p>
              <p><small>Estimated Transit</small><span id="qEta">-</span></p>
            </div>
            <button id="reset-patient" type="button">Clear Incident Marker</button>
          </aside>
        </div>
      </div>
    </section>
  );
}
