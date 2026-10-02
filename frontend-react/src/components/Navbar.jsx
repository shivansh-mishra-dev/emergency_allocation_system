export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <a href="#home" className="logo">
          <span className="logo-icon">🚑</span>
          <span>EmergencyCare</span>
        </a>
        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#allocation">Allocation</a>
          <a href="#ambulances">Ambulances</a>
          <a href="#hospitals">Hospitals</a>
          <a href="#map-section">Map</a>
          <a href="/login" className="login-btn">Sign In</a>
        </nav>
      </div>
    </header>
  );
}
