import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Provider {
  id: number;
  name: string;
  email: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  provider_id: number;
}

function Booking() {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  // Data fetched from API
  const [providers, setProviders] = useState<Provider[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // User selections
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Helper to convert 'YYYY-MM-DDTHH:MM:SS' into 'HH:MM'
  const formatTimeSlot = (slot: string) => {
    if (slot.includes('T')) {
      const timePart = slot.split('T')[1];
      return timePart.substring(0, 5);
    }
    return slot;
  };

  // Fetch providers on mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await api.get('/providers/');
        setProviders(response.data);
      } catch (err) {
        setError('Failed to fetch professionals.');
      }
    };
    fetchProviders();
  }, []);

  // Fetch services when provider is selected
  useEffect(() => {
    if (!selectedProvider) return;
    const fetchServices = async () => {
      try {
        const response = await api.get('/services/');
        // Filter services belonging to the selected provider
        const filtered = response.data.filter((s: Service) => s.provider_id === selectedProvider.id);
        setServices(filtered);
      } catch (err) {
        setError('Failed to fetch services.');
      }
    };
    fetchServices();
  }, [selectedProvider]);

  // Fetch availability when date is selected
  useEffect(() => {
    if (!selectedProvider || !selectedDate) return;
    const fetchAvailability = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/providers/${selectedProvider.id}/availability`, {
          params: { target_date: selectedDate },
        });
        setAvailableSlots(response.data.available_slots || []);
      } catch (err) {
        setError('Failed to load available hours for this day.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, [selectedProvider, selectedDate]);

  const handleBookingSubmit = async () => {
    if (!selectedProvider || !selectedService || !selectedDate || !selectedTime) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // selectedTime is already a full ISO string 'YYYY-MM-DDTHH:MM:SS'
      const startTimeISO = selectedTime;

      await api.post('/appointments/', {
        provider_id: selectedProvider.id,
        service_id: selectedService.id,
        start_time: startTimeISO,
      });

      alert('Appointment booked successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to schedule appointment. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <div className="welcome-card glass-panel hover-card" style={{ maxWidth: '440px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px', alignItems: 'center' }}>
          <h2 className="welcome-title" style={{ fontSize: '22px', margin: 0 }}>New Booking</h2>
          <span style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 600 }}>Step {step} of 4</span>
        </div>

        {error && <div className="error-banner" style={{ marginBottom: '16px' }}>{error}</div>}

        {/* STEP 1: Select Barber */}
        {step === 1 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'left', marginBottom: '8px' }}>Select a professional:</p>
            {providers.length === 0 ? (
              <p style={{ color: 'var(--text-disabled)' }}>No professionals available.</p>
            ) : (
              providers.map((p) => (
                <div 
                  key={p.id} 
                  className="glass-panel" 
                  style={{ padding: '16px', textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border-glass)' }}
                  onClick={() => {
                    setSelectedProvider(p);
                    setStep(2);
                  }}
                >
                  <h4 style={{ color: 'var(--text-main)', fontSize: '16px' }}>{p.name}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{p.email}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* STEP 2: Select Service */}
        {step === 2 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'left', marginBottom: '8px' }}>Select a service:</p>
            {services.length === 0 ? (
              <p style={{ color: 'var(--text-disabled)' }}>No services listed for this provider.</p>
            ) : (
              services.map((s) => (
                <div 
                  key={s.id} 
                  className="glass-panel" 
                  style={{ padding: '16px', textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border-glass)' }}
                  onClick={() => {
                    setSelectedService(s);
                    setStep(3);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '15px' }}>{s.name}</h4>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>${s.price.toFixed(2)}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{s.description}</p>
                  <p style={{ color: 'var(--text-disabled)', fontSize: '12px', marginTop: '4px' }}>Duration: {s.duration_minutes} min</p>
                </div>
              ))
            )}
            <button 
              className="action-button" 
              style={{ background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-muted)' }} 
              onClick={() => setStep(1)}
            >
              Back
            </button>
          </div>
        )}

        {/* STEP 3: Select Date & Time */}
        {step === 3 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Select Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime('');
                }}
              />
            </div>

            {selectedDate && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'left' }}>Select Time Slot:</p>
                {isLoading ? (
                  <p style={{ color: 'var(--text-disabled)', padding: '10px 0' }}>Checking availability...</p>
                ) : availableSlots.length === 0 ? (
                  <p style={{ color: 'var(--error)', fontSize: '13px' }}>No hours available for this day.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        className="btn"
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: selectedTime === time ? 'var(--primary)' : 'var(--bg-input)',
                          color: selectedTime === time ? 'var(--bg-main)' : 'var(--text-main)',
                          border: selectedTime === time ? 'none' : '1px solid var(--border-glass)',
                          fontWeight: selectedTime === time ? 600 : 500
                        }}
                        onClick={() => setSelectedTime(time)}
                      >
                        {formatTimeSlot(time)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button 
                className="action-button" 
                style={{ background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-muted)', flex: 1, marginTop: 0 }} 
                onClick={() => setStep(2)}
              >
                Back
              </button>
              <button 
                className="action-button" 
                style={{ flex: 1, marginTop: 0 }} 
                disabled={!selectedTime}
                onClick={() => setStep(4)}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Confirm */}
        {step === 4 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Professional: <strong style={{ color: 'var(--text-main)' }}>{selectedProvider?.name}</strong></p>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Service: <strong style={{ color: 'var(--text-main)' }}>{selectedService?.name}</strong></p>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Price: <strong style={{ color: 'var(--primary)' }}>${selectedService?.price.toFixed(2)}</strong></p>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Date: <strong style={{ color: 'var(--text-main)' }}>{selectedDate}</strong></p>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Time: <strong style={{ color: 'var(--text-main)' }}>{formatTimeSlot(selectedTime)}</strong></p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button 
                className="action-button" 
                style={{ background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-muted)', flex: 1, marginTop: 0 }} 
                onClick={() => setStep(3)}
                disabled={isSubmitting}
              >
                Back
              </button>
              <button 
                className="action-button" 
                style={{ flex: 1, marginTop: 0 }} 
                onClick={handleBookingSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Confirming...' : 'Book Now'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Booking;
