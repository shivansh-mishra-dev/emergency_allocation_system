import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import AmbulanceDashboard from './components/AmbulanceDashboard';
import Hospitals from './components/Hospitals';
import MapSection from './components/MapSection';
import AllocationForm from './components/AllocationForm';

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <AmbulanceDashboard />
      <Hospitals />
      <MapSection />
      <AllocationForm />
    </>
  );
}
