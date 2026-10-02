export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <div className="badge">🚨 24/7 Emergency Response</div>
        <h1>
          Emergency Ambulance <span>Allocation System</span>
        </h1>
        <p>Fast, intelligent and efficient ambulance allocation for emergency situations.</p>
        <div className="hero-buttons">
          <a href="#allocation" className="btn-primary">🚑 Request Ambulance</a>
          <a href="#ambulances" className="secondary-btn">Explore System</a>
        </div>
      </div>
      <div className="hero-image">
        <div className="circle">
          <div className="ambulance">🚑</div>
        </div>
      </div>
    </section>
  );
}
