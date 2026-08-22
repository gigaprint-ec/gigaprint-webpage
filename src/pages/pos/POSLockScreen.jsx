import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  ShieldCheck,
  Calendar,
  Key,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Delete,
  X
} from 'lucide-react';
import {
  authenticateAdvisor,
  authenticateAdmin,
  getISOWeekCode,
  getMondayOfWeek
} from '../../lib/posStore';

export function POSLockScreen({ advisors = [], onAuthenticated }) {
  const [selectedAdvisorId, setSelectedAdvisorId] = useState(advisors[0]?.id || '');
  const [pinInput, setPinInput] = useState('');
  const [loginMode, setLoginMode] = useState('advisor'); // 'advisor' | 'admin'
  const [adminPass, setAdminPass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const currentMonday = getMondayOfWeek();
  const currentWeekCode = getISOWeekCode();

  const selectedAdvisor = advisors.find((a) => a.id === selectedAdvisorId) || advisors[0];

  // Handle Physical Keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loginMode === 'advisor') {
        if (e.key >= '0' && e.key <= '9') {
          if (pinInput.length < 8) {
            setPinInput((prev) => prev + e.key);
            setErrorMsg('');
          }
        } else if (e.key === 'Backspace') {
          setPinInput((prev) => prev.slice(0, -1));
          setErrorMsg('');
        } else if (e.key === 'Enter') {
          handleAdvisorSubmit();
        } else if (e.key === 'Escape') {
          setPinInput('');
          setErrorMsg('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinInput, loginMode, selectedAdvisorId]);

  const handleKeypadPress = (num) => {
    if (pinInput.length < 8) {
      setPinInput((prev) => prev + num);
      setErrorMsg('');
    }
  };

  const handleKeypadBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleKeypadClear = () => {
    setPinInput('');
    setErrorMsg('');
  };

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
    setPinInput('');
  };

  const handleAdvisorSubmit = (e) => {
    if (e) e.preventDefault();
    if (!pinInput.trim()) {
      triggerError('Por favor ingresa tu PIN de 4 dígitos o contraseña.');
      return;
    }

    const res = authenticateAdvisor(advisors, selectedAdvisorId, pinInput);
    if (res.ok) {
      onAuthenticated(res.session);
    } else {
      triggerError(res.error || 'PIN incorrecto.');
    }
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (!adminPass.trim()) {
      triggerError('Ingresa la contraseña o PIN maestro.');
      return;
    }

    const res = authenticateAdmin(adminPass);
    if (res.ok) {
      onAuthenticated(res.session);
    } else {
      triggerError(res.error || 'Contraseña incorrecta.');
    }
  };

  return (
    <div className="pos-lock-screen-wrapper">
      <div className="pos-lock-modal-card">
        {/* Brand & Week Header */}
        <div className="pos-lock-header">
          <div className="pos-lock-logo">
            <span className="pos-lock-logo-mark">G</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'var(--ink)' }}>
                Gigaprint POS
              </h2>
              <small style={{ color: 'var(--muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                Punto de Venta & Caja
              </small>
            </div>
          </div>

          <div className="pos-lock-week-badge">
            <Calendar size={13} style={{ color: 'var(--orange)' }} />
            <span>Semana <b>{currentWeekCode}</b></span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="pos-lock-mode-toggle">
          <button
            type="button"
            className={`pos-lock-tab ${loginMode === 'advisor' ? 'active' : ''}`}
            onClick={() => {
              setLoginMode('advisor');
              setErrorMsg('');
              setPinInput('');
            }}
          >
            <User size={15} /> Asesoras Comerciales
          </button>
          <button
            type="button"
            className={`pos-lock-tab ${loginMode === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setLoginMode('admin');
              setErrorMsg('');
              setAdminPass('');
            }}
          >
            <ShieldCheck size={15} /> Acceso Administrador
          </button>
        </div>

        {/* ADVISOR LOGIN MODE */}
        {loginMode === 'advisor' && (
          <div className="pos-lock-advisor-flow">
            {/* Advisor Selector Avatars */}
            <div className="pos-advisor-pills-row">
              {advisors.filter((a) => a.isActive !== false).map((adv) => {
                const isSelected = adv.id === selectedAdvisorId;
                const initials = adv.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
                return (
                  <button
                    key={adv.id}
                    type="button"
                    className={`pos-advisor-pill-card ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedAdvisorId(adv.id);
                      setPinInput('');
                      setErrorMsg('');
                    }}
                  >
                    <div className="pos-advisor-pill-avatar">{initials}</div>
                    <span>{adv.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Advisor Display */}
            <div className="pos-selected-advisor-target">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={16} style={{ color: 'var(--orange)' }} />
                <span>Ingresa el PIN de <b>{selectedAdvisor?.name}</b>:</span>
              </div>
              <small style={{ color: 'var(--muted)', fontSize: '11px' }}>
                Renovado el Lunes {currentMonday}
              </small>
            </div>

            {/* PIN Mask Display */}
            <div className={`pos-pin-display-box ${isShaking ? 'shake' : ''}`}>
              <div className="pos-pin-dots">
                {[0, 1, 2, 3].map((idx) => (
                  <span
                    key={idx}
                    className={`pos-pin-dot ${pinInput.length > idx ? 'filled' : ''}`}
                  />
                ))}
              </div>
              {pinInput.length > 4 && (
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--orange-dark)' }}>
                  ({pinInput.length} caracteres)
                </span>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="pos-lock-error-banner">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Touch Keypad */}
            <div className="pos-touch-keypad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  className="pos-keypad-btn"
                  onClick={() => handleKeypadPress(String(num))}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                className="pos-keypad-btn action"
                onClick={handleKeypadClear}
                title="Limpiar"
              >
                C
              </button>
              <button
                type="button"
                className="pos-keypad-btn"
                onClick={() => handleKeypadPress('0')}
              >
                0
              </button>
              <button
                type="button"
                className="pos-keypad-btn action"
                onClick={handleKeypadBackspace}
                title="Borrar dígito"
              >
                <Delete size={18} />
              </button>
            </div>

            {/* Unlock Button */}
            <button
              type="button"
              className="pos-unlock-submit-btn"
              onClick={handleAdvisorSubmit}
              disabled={pinInput.length === 0}
            >
              <span>Desbloquear Turno</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ADMIN LOGIN MODE */}
        {loginMode === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="pos-lock-admin-flow">
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--orange) 0%, var(--orange-dark) 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                boxShadow: '0 8px 20px rgba(234, 88, 12, 0.3)'
              }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: 'var(--ink)' }}>
                Modo Administrador General
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
                Acceso a todas las asesoras, cuadres consolidados y Hub Maestro de Credenciales.
              </p>
            </div>

            {errorMsg && (
              <div className="pos-lock-error-banner" style={{ marginBottom: '14px' }}>
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pos-form-group" style={{ marginBottom: '16px' }}>
              <label>PIN Maestro o Contraseña Admin</label>
              <input
                type="password"
                autoFocus
                placeholder="Ingresa clave o PIN maestro (ej. 0000)"
                value={adminPass}
                onChange={(e) => {
                  setAdminPass(e.target.value);
                  setErrorMsg('');
                }}
                style={{ fontSize: '16px', padding: '12px 14px' }}
              />
            </div>

            <button
              type="submit"
              className="pos-unlock-submit-btn"
            >
              <span>Entrar como Administrador</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
