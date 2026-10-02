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
  const mapRef = useRef(null);  // DOM node
  const stateRef = useRef({});  // mutable map state

  useEffect(() => {
    if (!window.L) return;
    const L = window.L;

    const ambulances = AMBULANCES.map((a) => ({ ...a }));
    const icon = (cls, t) =>
      L.divIcon({
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
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
      } catch (_) {}

      route = L.polyline(path, { color: '#e23744', weight: 5 }).addTo(map);
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
        resultEl.innerHTML = `<p style="color:red;">❌ Ambulance not found on map.</p>`;
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
      } catch (_) {}

      if (route) map.removeLayer(route);
      route = L.polyline(path, { color: '#e23744', weight: 5 }).addTo(map);
      $('qAmb').textContent = `${specificAmb.id} (${km.toFixed(1)} km)`;
      $('qEta').textContent = `${Math.max(1, Math.round((km / 40) * 60))} min`;

      resultEl.innerHTML = `
        <div class="allocation-result">
          <h3>🚑 Ambulance Allocated (Via Backend!)</h3>
          <p><strong>Ambulance:</strong> ${specificAmb.id}</p>
          <p><strong>Priority:</strong> ${priority}</p>
          <p><strong>Hospital:</strong> ${hospitalName}</p>
          <p><strong>Status:</strong> Assigned</p>
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
            <h2>🗺️ Chandigarh Emergency Map</h2>
            <p>Ambulance and hospital locations for emergency allocation</p>
          </div>
          <div className="map-status"><span>● System Active</span></div>
        </div>

        <div className="em-layout">
          <div ref={mapRef} id="map" style={{ height: '520px', borderRadius: '12px' }} />
          <aside className="em-side">
            <h3>Available Resources</h3>
            <div className="em-row"><span>Available Ambulances</span><b id="cOk">0</b></div>
            <div className="em-row"><span>Busy Ambulances</span><b id="cBusy">0</b></div>
            <div className="em-row"><span>Hospitals</span><b id="cHosp">0</b></div>
            <div className="em-row"><span>Patients</span><b id="cPat">0</b></div>
            <div className="em-quick">
              <strong>Quick View</strong>
              <p><small>Nearest Ambulance</small><span id="qAmb">Click on the map</span></p>
              <p><small>Nearest Hospital</small><span id="qHosp">-</span></p>
              <p><small>Estimated Arrival</small><span id="qEta">-</span></p>
            </div>
            <button id="reset-patient" type="button">Clear patient</button>
          </aside>
        </div>
      </div>

      <style>{`
        .em-layout { display:grid; grid-template-columns:1fr 300px; gap:16px; }
        .em-side { background:#fff; border:1px solid #e3e8f0; border-radius:12px; padding:16px; align-self:start; }
        .em-side h3 { margin:0 0 8px; }
        .em-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e3e8f0; }
        .em-quick { margin-top:12px; background:#eef4ff; border-radius:10px; padding:12px; }
        .em-quick p { margin:8px 0 0; } .em-quick small { display:block; color:#5b6478; }
        .em-side button { margin-top:12px; width:100%; padding:9px; border:0; border-radius:8px; background:#1f6fe5; color:#fff; cursor:pointer; }
        .pin { display:grid; place-items:center; width:30px; height:30px; border-radius:50%; color:#fff; font:700 12px sans-serif; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,.35); }
        .pin.ok { background:#1a9c55; } .pin.busy { background:#e23744; }
        .pin.hosp { background:#1f6fe5; border-radius:6px; } .pin.pat { background:#f39c12; }
        @media (max-width:800px) { .em-layout { grid-template-columns:1fr; } }
      `}</style>
    </section>
  );
}
