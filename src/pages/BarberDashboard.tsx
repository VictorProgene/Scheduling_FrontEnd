import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Appointment {
  id: number;
  provider_id: number;
  service_id: number;
  start_time: string;
  end_time: string;
  status: string;
  client_name: string;
  client_email: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
}

function BarberDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Record<number, { name: string; price: number }>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch appointments for this specific provider
        const apptResponse = await api.get('/appointments/provider');
        setAppointments(apptResponse.data);

        // Fetch services to map name and price on cards
        const servResponse = await api.get('/services/');
        const servMap: Record<number, { name: string; price: number }> = {};
        servResponse.data.forEach((s: Service) => {
          servMap[s.id] = { name: s.name, price: s.price };
        });
        setServices(servMap);
      } catch (err: any) {
        if (err.response && err.response.data && err.response.data.detail) {
          setError(err.response.data.detail);
        } else {
          setError('Failed to load your agenda. Make sure backend is running.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to format date & time
  const formatDateTime = (isoString: string) => {
    const dateObj = new Date(isoString);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} at ${timeStr}`;
  };

  return (
    <div className="app-container" style={{ paddingBottom: '80px' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '440px', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', color: 'var(--text-muted)', textAlign: 'left', margin: 0 }}>Barber Panel</h2>
          <h1 style={{ fontSize: '26px', color: 'var(--primary)', margin: 0, textAlign: 'left' }}>{user?.name || 'Professional'}</h1>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-muted)',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ color: 'var(--text-main)', fontSize: '16px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
          Your Schedule
        </h3>

        {isLoading ? (
          <div style={{ color: 'var(--text-muted)', padding: '40px 0' }}>Loading appointments...</div>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No appointments scheduled with you yet.
          </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt.id} className="glass-panel hover-card" style={{ padding: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ color: 'var(--text-main)', fontSize: '16px', margin: 0 }}>
                  {services[appt.service_id]?.name || 'Haircut/Service'}
                </h4>
                <span style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 600 }}>
                  ${services[appt.service_id]?.price?.toFixed(2) || '0.00'}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                  Client: <strong style={{ color: 'var(--text-main)' }}>{appt.client_name}</strong>
                </p>
                <p style={{ color: 'var(--text-disabled)', fontSize: '12px', margin: 0 }}>
                  Contact: {appt.client_email}
                </p>
                <p style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 500, marginTop: '6px' }}>
                  Time: {formatDateTime(appt.start_time)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BarberDashboard;
