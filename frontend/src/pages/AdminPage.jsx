// src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { getPendingUsers, approveUser, apiFetch } from '../services/api'; 
import { CheckCircle, User, ShieldAlert, LogOut, MapPin, Phone, Briefcase, Activity, Users } from 'lucide-react'; // Hapus 'Box' jika tidak dipakai
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SmartBoxDataDisplay from "../components/SmartBoxDataDisplay";
import { useTranslation } from 'react-i18next'; // <--- IMPORT PENTING
import '../App.css'; 

const AdminPage = () => {
  const { t } = useTranslation(); // <--- DESTRUCTURE t
  const [activeTab, setActiveTab] = useState('monitoring'); 
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allDeviceIds, setAllDeviceIds] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const data = await getPendingUsers();
      setPendingUsers(data);
    } catch (err) {
      console.error("Gagal ambil user:", err);
    }
  };

  const fetchAllDevices = async () => {
    try {
      const data = await apiFetch('/api/admin/devices', { method: 'GET' });
      setAllDeviceIds(data);
    } catch (err) {
      console.error("Gagal ambil device global:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchUsers(), fetchAllDevices()]);
      setIsLoading(false);
    };
    init();
  }, []);

  const handleApprove = async (userId, username) => {
    // Gunakan translasi dengan parameter dynamic
    if(!window.confirm(t('admin.approval.confirm', { username }))) return;

    try {
      await approveUser(userId);
      setMessage(t('admin.approval.success', { username }));
      fetchUsers(); 
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(t('admin.approval.fail') + err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="section" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* --- HEADER --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 className="section-title" style={{ textAlign: 'left', display:'flex', alignItems:'center', gap:'10px', margin: 0 }}>
              <ShieldAlert size={32} color="#1565C0" />
              {t('admin.title')} {/* "Command Center" */}
            </h2>
            <button onClick={handleLogout} className="auth-button" style={{ background: '#ef4444', border: 'none' }}>
                <LogOut size={16} /> {t('header.nav.logout')} {/* Reuse dari header */}
            </button>
        </div>

        {/* --- STATS RINGKAS --- */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
           <div className="stat-card visible" style={{ padding: '1.5rem' }}>
              <div className="stat-number" style={{ fontSize: '2rem' }}>{allDeviceIds.length}</div>
              <div className="stat-label">{t('admin.stats.totalFleet')}</div>
           </div>
           <div className="stat-card visible" style={{ padding: '1.5rem' }}>
              <div className="stat-number" style={{ fontSize: '2rem' }}>{pendingUsers.length}</div>
              <div className="stat-label">{t('admin.stats.requests')}</div>
           </div>
           <div className="stat-card visible" style={{ padding: '1.5rem' }}>
              <div className="stat-number" style={{ fontSize: '2rem', color: '#22c55e' }}>{t('admin.stats.online')}</div>
              <div className="stat-label">{t('admin.stats.system')}</div>
           </div>
        </div>

        {message && (
          <div className="signupSuccessMessage" style={{marginBottom: '2rem'}}>
            {message}
          </div>
        )}

        {/* --- TAB NAVIGATION --- */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0' }}>
            <button 
                onClick={() => setActiveTab('monitoring')}
                style={{
                    padding: '1rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'monitoring' ? '3px solid var(--primary-blue)' : '3px solid transparent',
                    fontWeight: 'bold',
                    color: activeTab === 'monitoring' ? 'var(--dark-blue)' : '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px'
                }}
            >
                <Activity size={18} /> {t('admin.tabs.monitoring')}
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                style={{
                    padding: '1rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'users' ? '3px solid var(--primary-blue)' : '3px solid transparent',
                    fontWeight: 'bold',
                    color: activeTab === 'users' ? 'var(--dark-blue)' : '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px'
                }}
            >
                <Users size={18} /> {t('admin.tabs.approval')} {pendingUsers.length > 0 && <span style={{background:'#ef4444', color:'white', padding:'2px 6px', borderRadius:'10px', fontSize:'0.7rem'}}>{pendingUsers.length}</span>}
            </button>
        </div>

        {/* --- CONTENT AREA --- */}
        
        {/* TAB 1: GLOBAL MONITORING */}
        {activeTab === 'monitoring' && (
            <div className="fade-in">
                {allDeviceIds.length > 0 ? (
                    <SmartBoxDataDisplay boxIds={allDeviceIds} />
                ) : (
                    <p style={{textAlign:'center', padding:'2rem', color:'#64748b'}}>
                      {t('admin.monitoring.empty')}
                    </p>
                )}
            </div>
        )}

        {/* TAB 2: APPROVAL USER */}
        {activeTab === 'users' && (
            <div className="fade-in chart-container">
              <h3 className="chart-title">{t('admin.approval.title')}</h3>
              
              {pendingUsers.length === 0 ? (
                <div style={{textAlign:'center', padding:'3rem', color:'#94a3b8'}}>
                  <CheckCircle size={64} style={{margin:'0 auto 1rem', opacity:0.3}} />
                  <p>{t('admin.approval.empty')}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {pendingUsers.map(user => (
                    <div key={user.id} style={{ 
                      display: 'flex', flexDirection: 'column', padding: '1.5rem',
                      border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc'
                    }}>
                      <div style={{display:'flex', alignItems:'flex-start', gap:'1.5rem', marginBottom: '1rem'}}>
                        <div style={{ background:'linear-gradient(135deg, #e0f2fe, #bae6fd)', padding:'1rem', borderRadius:'12px' }}>
                          <Briefcase size={32} color="#0284c7" />
                        </div>
                        <div style={{flex: 1}}>
                            <h4 style={{margin:0, fontSize:'1.3rem', color:'var(--text-dark)', fontWeight:'700'}}>
                                {user.business_name || t('admin.approval.noBusinessName')}
                            </h4>
                            <div style={{marginTop:'0.5rem', fontSize:'0.9rem', color:'#475569'}}>
                                <div><strong>{t('admin.approval.user')}:</strong> {user.username} ({user.email})</div>
                                <div><strong>{t('admin.approval.type')}:</strong> {user.business_type}</div>
                                <div><strong>{t('admin.approval.address')}:</strong> {user.address}</div>
                            </div>
                        </div>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem'}}>
                        <button 
                            onClick={() => handleApprove(user.id, user.username)}
                            style={{
                                background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white',
                                border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight:'600',
                                display:'flex', alignItems:'center', gap:'0.5rem'
                            }}
                        >
                            <CheckCircle size={18} /> {t('admin.approval.approve')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminPage;