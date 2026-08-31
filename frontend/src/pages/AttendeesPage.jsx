import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../utils/constants';

export default function AttendeesPage(){
  const [attendees, setAttendees] = useState([]);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ name:'', email:'', eventIds:'' });
  const [editId, setEditId] = useState(null);

  const load = async () => {
    const [as, ev] = await Promise.all([
      fetch(`${API_BASE_URL}/attendees`).then(r=>r.json()),
      fetch(`${API_BASE_URL}/events`).then(r=>r.json())
    ]);
    setAttendees(as); setEvents(ev);
  };
  useEffect(()=>{ load(); },[]);

  const onChange = e => setForm(f => ({...f, [e.target.name]: e.target.value}));

  const parseIds = (str) => (str || '').split(',').map(s=>s.trim()).filter(Boolean).map(Number);

  const create = async (e) => {
    e.preventDefault();
    const body = { name: form.name, email: form.email, eventIds: parseIds(form.eventIds) };
    const res = await fetch(`${API_BASE_URL}/attendees`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)
    });
    if (!res.ok) {
      const msg = await res.json().catch(()=>({}));
      alert(msg.error || 'Failed to add attendee');
      return;
    }
    const created = await res.json();
    setAttendees(prev => [created, ...prev]);
    setForm({ name:'', email:'', eventIds:'' });
  };

  const save = async (id, row) => {
    const eventIds = Array.isArray(row.eventIds) ? row.eventIds : parseIds(row.eventIdsInput || '');
    const res = await fetch(`${API_BASE_URL}/attendees/${id}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name: row.name, email: row.email, eventIds })
    });
    if (!res.ok) {
      const msg = await res.json().catch(()=>({}));
      alert(msg.error || 'Failed to update attendee');
      return;
    }
    const updated = await res.json();
    setAttendees(prev => prev.map(a => a.id===id? updated : a));
    setEditId(null);
  };

  const remove = async (id) => {
    await fetch(`${API_BASE_URL}/attendees/${id}`, { method:'DELETE' });
    setAttendees(prev => prev.filter(a => a.id!==id));
  };

  return (
    <div>
      <h2>Attendees</h2>
      <form className="inline" onSubmit={create}>
        <input name="name" placeholder="Name" value={form.name} onChange={onChange} required />
        <input name="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input name="eventIds" placeholder="Event IDs (comma-separated)" value={form.eventIds} onChange={onChange} />
        <button className="primary" type="submit">Add</button>
      </form>
      <p className="note">Tip: Use the Events page to see IDs, then assign them here.</p>

      <table className="table" style={{marginTop:'1rem'}}>
        <thead>
          <tr>
            <th>ID</th> {/* NEW */}
            <th>Name</th>
            <th>Email</th>
            <th>Registered Events</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {attendees.map(row => (
            <tr key={row.id}>
              <td>{row.id}</td> {/* NEW */}
              <td>
                {editId===row.id ? (
                  <input defaultValue={row.name} onChange={e=>row.name=e.target.value}/>
                ) : row.name}
              </td>
              <td>
                {editId===row.id ? (
                  <input defaultValue={row.email} onChange={e=>row.email=e.target.value}/>
                ) : row.email}
              </td>
              <td>
                {editId===row.id ? (
                  <input
                    placeholder="Event IDs (comma-separated)"
                    defaultValue={(row.eventIds||[]).join(',')}
                    onChange={e=>row.eventIdsInput=e.target.value}
                  />
                ) : (row.eventIds||[]).join(', ')}
              </td>
              <td className="actions">
                {editId===row.id ? (
                  <>
                    <button onClick={()=>save(row.id, row)} className="primary">Save</button>
                    <button onClick={()=>setEditId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={()=>setEditId(row.id)}>Edit</button>
                    <button onClick={()=>remove(row.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
