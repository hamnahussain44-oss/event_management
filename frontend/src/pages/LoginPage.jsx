import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/constants';

export default function LoginPage(){
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL.replace('/api','')}/api/login`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ username })
    });
    if(res.ok){
      localStorage.setItem('auth','true');
      localStorage.setItem('username', username);
      navigate('/');
    }
  };
  return (
    <div className="card">
      <h2>Login</h2>
      <form className="inline" onSubmit={submit}>
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required />
        <button className="primary" type="submit">Login</button>
      </form>
      <p className="note">Any username works for this demo.</p>
    </div>
  );
}
