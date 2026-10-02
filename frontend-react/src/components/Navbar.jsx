export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">🚑 <span>EmergencyCare</span></div>
      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#allocation">Allocation</a>
        <a href="#ambulances">Ambulances</a>
        <a href="#hospitals">Hospitals</a>
        <a href="/login" className="login-btn">Login</a>
      </div>
    </nav>
  );
}
