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
}

interface Provider {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
}

function Dashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [providers, setProviders] = useState<Record<number, string>>({});
  const [services, setServices] = useState<Record<number, { name: string; price: number }>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user appointments
        const apptResponse = await api.get('/appointments/me');
        setAppointments(apptResponse.data);

        // Fetch providers and services to resolve names on cards
        const provResponse = await api.get('/providers/');
        const provMap: Record<number, string> = {};
        provResponse.data.forEach((p: Provider) => {
          provMap[p.id] = p.name;
        });
        setProviders(provMap);

        const servResponse = await api.get('/services/');
        const servMap: Record<number, { name: string; price: number }> = {};
        servResponse.data.forEach((s: Service) => {
          servMap[s.id] = { name: s.name, price: s.price };
        });
        setServices(servMap);
      } catch (err: any) {
        setError('Failed to load dashboard data. Make sure backend is running.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCancel = async (id: number) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this appointment?');
    if (!confirmCancel) return;

    try {
      await api.delete(`/appointments/${id}`);
      setAppointments((prev) => prev.filter((appt) => appt.id !== id));
    } catch (err) {
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container" style={{ paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '440px', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', color: 'var(--text-main)', textAlign: 'left' }}>Hello,</h2>
          <h1 style={{ fontSize: '28px', color: 'var(--primary)', margin: 0, textAlign: 'left' }}>{user?.name || 'Client'}</h1>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-muted)',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ color: 'var(--text-muted)', fontSize: '16px', textAlign: 'left', fontWeight: 500 }}>Your Appointments</h3>

        {isLoading ? (
          <div style={{ color: 'var(--text-muted)', padding: '40px 0' }}>Loading appointments...</div>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No appointments scheduled yet.
          </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt.id} className="glass-panel hover-card" style={{ padding: '20px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ color: 'var(--text-main)', fontSize: '16px', marginBottom: '4px' }}>
                  {services[appt.service_id]?.name || 'Service'}
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                  Professional: {providers[appt.provider_id] || 'Barber'}
                </p>
                <p style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 500 }}>
                  Date: {new Date(appt.start_time).toLocaleDateString()} at {new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                  Price: ${services[appt.service_id]?.price?.toFixed(2) || '0.00'}
                </p>
              </div>
              <button 
                onClick={() => handleCancel(appt.id)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'var(--error)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              >
                Cancel
              </button>
            </div>
          ))
        )}

        <button 
          className="action-button" 
          onClick={() => navigate('/booking')}
          style={{ marginTop: '12px' }}
        >
          Book New Appointment
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
