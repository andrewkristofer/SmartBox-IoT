// src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { getPendingUsers, approveUser } from '../services/api';
import { CheckCircle, User, ShieldAlert, LogOut, MapPin, Phone, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 

const AdminPage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId, username) => {
    if(!window.confirm(`Setujui akun mitra "${username}"?`)) return;

    try {
      await approveUser(userId);
      setMessage(`Sukses! Akun ${username} telah aktif.`);
      fetchUsers(); 
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert("Gagal approve: " + err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="section" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 className="section-title" style={{ textAlign: 'left', display:'flex', alignItems:'center', gap:'10px', margin: 0 }}>
            <ShieldAlert size={32} color="#1565C0" />
            Super Admin Dashboard
            </h2>
            <button onClick={handleLogout} className="auth-button" style={{ background: '#ef4444', border: 'none' }}>
                <LogOut size={16} /> Keluar
            </button>
        </div>

        {message && (
          <div className="signupSuccessMessage" style={{marginBottom: '2rem'}}>
            {message}
          </div>
        )}

        <div className="chart-container">
          <h3 className="chart-title">Permintaan Mitra Baru ({pendingUsers.length})</h3>
          
          {isLoading ? (
            <p style={{textAlign:'center', padding:'2rem'}}>Memuat data...</p>
          ) : pendingUsers.length === 0 ? (
            <div style={{textAlign:'center', padding:'3rem', color:'#94a3b8'}}>
              <CheckCircle size={64} style={{margin:'0 auto 1rem', opacity:0.3}} />
              <p>Tidak ada permintaan pendaftaran baru saat ini.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {pendingUsers.map(user => (
                <div key={user.id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  padding: '1.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{display:'flex', alignItems:'flex-start', gap:'1.5rem', marginBottom: '1rem'}}>
                    {/* Avatar */}
                    <div style={{
                        background:'linear-gradient(135deg, #e0f2fe, #bae6fd)', 
                        padding:'1rem', 
                        borderRadius:'12px', 
                        alignSelf: 'flex-start'
                    }}>
                      <Briefcase size={32} color="#0284c7" />
                    </div>
                    
                    {/* Info Content */}
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px'}}>
                          <div>
                            <h4 style={{margin:0, fontSize:'1.3rem', color:'var(--text-dark)', fontWeight:'700'}}>
                                {user.business_name || "Tanpa Nama Usaha"}
                            </h4>
                            <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'4px'}}>
                                <span style={{fontSize:'0.9rem', color:'#64748b', display:'flex', alignItems:'center', gap:'4px'}}>
                                    <User size={14}/> {user.username}
                                </span>
                                <span style={{color:'#cbd5e1'}}>|</span>
                                <span style={{fontSize:'0.9rem', color:'#64748b'}}>
                                    {user.email}
                                </span>
                            </div>
                          </div>
                          <span style={{fontSize:'0.8rem', color:'#64748b', background: '#e2e8f0', padding: '0.3rem 0.8rem', borderRadius: '20px'}}>
                            Daftar: {new Date(user.created_at).toLocaleDateString('id-ID')}
                          </span>
                      </div>
                      
                      <div style={{marginTop:'1.2rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1', fontSize:'0.95rem', color:'#475569', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem'}}>
                          <div>
                              <strong style={{display:'block', marginBottom:'4px', color:'#334155'}}>Tipe Usaha:</strong> 
                              {user.business_type || '-'}
                          </div>
                          <div>
                              <strong style={{display:'block', marginBottom:'4px', color:'#334155'}}>Telepon:</strong> 
                              <span style={{display:'flex', alignItems:'center', gap:'6px'}}>
                                <Phone size={14}/> {user.phone || '-'}
                              </span>
                          </div>
                          <div style={{gridColumn: '1 / -1'}}>
                              <strong style={{display:'block', marginBottom:'4px', color:'#334155'}}>Alamat:</strong> 
                              <span style={{display:'flex', alignItems:'center', gap:'6px'}}>
                                <MapPin size={14}/> {user.address || '-'}
                              </span>
                          </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '0.5rem'}}>
                    <button 
                        onClick={() => handleApprove(user.id, user.username)}
                        style={{
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: 'white',
                        border: 'none',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display:'flex', alignItems:'center', gap:'0.5rem',
                        transition: 'all 0.2s',
                        fontSize: '1rem',
                        boxShadow: '0 4px 6px -1px rgba(34, 197, 94, 0.3)'
                        }}
                    >
                        <CheckCircle size={20} /> Setujui Mitra Ini
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminPage;