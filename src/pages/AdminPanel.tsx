import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface AdminAppointment {
  id: number;
  start_time: string;
  end_time: string;
  status: string;
  client_name: string;
  client_email: string;
  provider_name: string;
  service_name: string;
  price: number;
}

interface Provider {
  id: number;
  name: string;
  email: string;
  start_work_hour: number;
  end_work_hour: number;
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  provider_id: number;
}

function AdminPanel() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Active tab state: 'schedule' | 'barbers' | 'services'
  const [activeTab, setActiveTab] = useState<'schedule' | 'barbers' | 'services'>('schedule');

  // Lists state
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Load and Error states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form states - New Barber
  const [barberName, setBarberName] = useState('');
  const [barberEmail, setBarberEmail] = useState('');
  const [barberStart, setBarberStart] = useState('9');
  const [barberEnd, setBarberEnd] = useState('18');
  const [barberPassword, setBarberPassword] = useState('');

  // Form states - New Service
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('30');
  const [serviceProviderId, setServiceProviderId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all necessary data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [apptRes, provRes, servRes] = await Promise.all([
        api.get('/admin/appointments'),
        api.get('/providers/'),
        api.get('/services/')
      ]);
      setAppointments(apptRes.data);
      setProviders(provRes.data);
      setServices(servRes.data);
      
      // Default selected provider for service creation form
      if (provRes.data.length > 0) {
        setServiceProviderId(String(provRes.data[0].id));
      }
    } catch (err: any) {
      setError('Failed to load admin panel data. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Add Barber Submit
  const handleAddBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barberName || !barberEmail) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post('/providers/', {
        name: barberName,
        email: barberEmail,
        start_work_hour: parseInt(barberStart, 10),
        end_work_hour: parseInt(barberEnd, 10),
        password: barberPassword || undefined
      });

      // Reset form
      setBarberName('');
      setBarberEmail('');
      setBarberPassword('');
      alert('Barber created successfully!');
      
      // Refresh list
      await fetchData();
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to create barber.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Service Submit
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName || !servicePrice || !serviceProviderId) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post('/services/', {
        name: serviceName,
        description: serviceDesc,
        price: parseFloat(servicePrice),
        duration_minutes: parseInt(serviceDuration, 10),
        provider_id: parseInt(serviceProviderId, 10)
      });

      // Reset form
      setServiceName('');
      setServiceDesc('');
      setServicePrice('');
      alert('Service created successfully!');

      // Refresh list
      await fetchData();
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to create service.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel Appointment
  const handleCancelAppointment = async (id: number) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this appointment as Admin?');
    if (!confirmCancel) return;

    try {
      await api.delete(`/admin/appointments/${id}`);
      setAppointments((prev) => prev.filter((appt) => appt.id !== id));
      alert('Appointment canceled.');
    } catch (err) {
      alert('Failed to cancel appointment.');
    }
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
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '500px', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', color: 'var(--text-muted)', textAlign: 'left', margin: 0 }}>Manager Console</h2>
          <h1 style={{ fontSize: '26px', color: 'var(--primary)', margin: 0, textAlign: 'left' }}>Admin Panel</h1>
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

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', width: '100%', maxWidth: '500px', borderBottom: '1px solid var(--border-glass)', marginBottom: '24px', gap: '8px' }}>
        {(['schedule', 'barbers', 'services'] as const).map((tab) => (
          <button
            key={tab}
            style={{
              flex: 1,
              padding: '12px 8px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : 'none',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '14px',
              fontWeight: activeTab === tab ? 600 : 500,
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'schedule' ? 'Agenda Geral' : tab}
          </button>
        ))}
      </div>

      {error && <div className="error-banner" style={{ maxWidth: '500px', width: '100%', marginBottom: '16px' }}>{error}</div>}

      {/* Main Container */}
      <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {isLoading ? (
          <div style={{ color: 'var(--text-muted)', padding: '40px 0' }}>Loading content...</div>
        ) : (
          <>
            {/* TAB 1: Consolidated Schedule */}
            {activeTab === 'schedule' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ color: 'var(--text-muted)', fontSize: '15px', textAlign: 'left', margin: 0 }}>All Bookings</h3>
                {appointments.length === 0 ? (
                  <p style={{ color: 'var(--text-disabled)', padding: '20px 0' }}>No bookings scheduled in the system.</p>
                ) : (
                  appointments.map((appt) => (
                    <div key={appt.id} className="glass-panel" style={{ padding: '16px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ color: 'var(--text-main)', fontSize: '15px', margin: '0 0 4px 0' }}>{appt.service_name}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 4px 0' }}>
                          Client: <strong>{appt.client_name}</strong> ({appt.client_email})
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 6px 0' }}>
                          Barber: <strong>{appt.provider_name}</strong>
                        </p>
                        <p style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 500, margin: 0 }}>
                          Time: {formatDateTime(appt.start_time)}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleCancelAppointment(appt.id)}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: 'var(--error)',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: Barbers Management */}
            {activeTab === 'barbers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Form to add barber */}
                <form className="glass-panel" onSubmit={handleAddBarber} style={{ padding: '20px', textAlign: 'left' }}>
                  <h3 style={{ color: 'var(--primary)', fontSize: '16px', margin: '0 0 16px 0', fontWeight: 600 }}>Create New Barber</h3>
                  <div className="form-group">
                    <label>Barber Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="James" 
                      required 
                      value={barberName} 
                      onChange={(e) => setBarberName(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="james@gmail.com" 
                      required 
                      value={barberEmail} 
                      onChange={(e) => setBarberEmail(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Initial Login Password (Optional)</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="Leave blank for default (Barber123!)" 
                      value={barberPassword} 
                      onChange={(e) => setBarberPassword(e.target.value)} 
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Shift Start (Hour)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="23" 
                        className="form-input" 
                        required 
                        value={barberStart} 
                        onChange={(e) => setBarberStart(e.target.value)} 
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Shift End (Hour)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="23" 
                        className="form-input" 
                        required 
                        value={barberEnd} 
                        onChange={(e) => setBarberEnd(e.target.value)} 
                      />
                    </div>
                  </div>
                  <button type="submit" className="action-button" disabled={isSubmitting} style={{ marginTop: '8px' }}>
                    {isSubmitting ? 'Creating...' : 'Register Barber'}
                  </button>
                </form>

                {/* List of active barbers */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h3 style={{ color: 'var(--text-muted)', fontSize: '15px', textAlign: 'left', margin: 0 }}>Registered Barbers</h3>
                  {providers.map((p) => (
                    <div key={p.id} className="glass-panel" style={{ padding: '16px', textAlign: 'left' }}>
                      <h4 style={{ color: 'var(--text-main)', fontSize: '16px', margin: '0 0 4px 0' }}>{p.name}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 4px 0' }}>Email: {p.email}</p>
                      <p style={{ color: 'var(--text-disabled)', fontSize: '12px', margin: 0 }}>
                        Workday: {p.start_work_hour}:00 to {p.end_work_hour}:00
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Services Management */}
            {activeTab === 'services' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Form to add service */}
                <form className="glass-panel" onSubmit={handleAddService} style={{ padding: '20px', textAlign: 'left' }}>
                  <h3 style={{ color: 'var(--primary)', fontSize: '16px', margin: '0 0 16px 0', fontWeight: 600 }}>Create New Service</h3>
                  
                  <div className="form-group">
                    <label>Assign to Barber</label>
                    <select 
                      className="form-input" 
                      value={serviceProviderId} 
                      onChange={(e) => setServiceProviderId(e.target.value)}
                      style={{ background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-glass)' }}
                    >
                      {providers.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Service Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Military Haircut" 
                      required 
                      value={serviceName} 
                      onChange={(e) => setServiceName(e.target.value)} 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Short Description</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Classic short sides with gradient fade." 
                      value={serviceDesc} 
                      onChange={(e) => setServiceDesc(e.target.value)} 
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Price ($)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="form-input" 
                        placeholder="35.00" 
                        required 
                        value={servicePrice} 
                        onChange={(e) => setServicePrice(e.target.value)} 
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Duration (Minutes)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        required 
                        value={serviceDuration} 
                        onChange={(e) => setServiceDuration(e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="action-button" disabled={isSubmitting} style={{ marginTop: '8px' }}>
                    {isSubmitting ? 'Creating...' : 'Register Service'}
                  </button>
                </form>

                {/* List of active services */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h3 style={{ color: 'var(--text-muted)', fontSize: '15px', textAlign: 'left', margin: 0 }}>Registered Services</h3>
                  {services.map((s) => (
                    <div key={s.id} className="glass-panel" style={{ padding: '16px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ color: 'var(--text-main)', fontSize: '15px', margin: '0 0 4px 0' }}>{s.name}</h4>
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>${s.price.toFixed(2)}</span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 4px 0' }}>{s.description}</p>
                      <p style={{ color: 'var(--text-disabled)', fontSize: '12px', margin: 0 }}>
                        Duration: {s.duration_minutes} min | Barber: {providers.find(p => p.id === s.provider_id)?.name || 'Unknown'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
