import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../utils/constants';

export default function EventsPage(){
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({ title:'', date:'', venueId:'', description:'' });
  const [editId, setEditId] = useState(null);

  const load = async () => {
    const [ev, vs] = await Promise.all([
      fetch(`${API_BASE_URL}/events`).then(r=>r.json()),
      fetch(`${API_BASE_URL}/venues`).then(r=>r.json())
    ]);
    setEvents(ev); setVenues(vs);
  };
  useEffect(()=>{ load(); },[]);

  const onChange = e => setForm(f => ({...f, [e.target.name]: e.target.value}));

  const create = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/events`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, venueId: form.venueId ? Number(form.venueId) : null })
    });
    const created = await res.json();
    setEvents(prev => [created, ...prev]);
    setForm({ title:'', date:'', venueId:'', description:'' });
  };

  const save = async (id, row) => {
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...row, venueId: row.venue_id ? Number(row.venue_id) : (row.venueId? Number(row.venueId): null) })
    });
    const updated = await res.json();
    setEvents(prev => prev.map(e => e.id===id? updated : e));
    setEditId(null);
  };

  const remove = async (id) => {
    await fetch(`${API_BASE_URL}/events/${id}`, { method:'DELETE' });
    setEvents(prev => prev.filter(e => e.id!==id));
  };

  return (
    <div>
      <h2>Events</h2>
      <form className="inline" onSubmit={create}>
        <input name="title" placeholder="Title" value={form.title} onChange={onChange} required />
        <input name="date" type="date" value={form.date} onChange={onChange} />
        <select name="venueId" value={form.venueId} onChange={onChange}>
          <option value="">Select Venue</option>
          {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <input name="description" placeholder="Description" value={form.description} onChange={onChange} />
        <button className="primary" type="submit">Add</button>
      </form>

      <table className="table" style={{marginTop:'1rem'}}>
        <thead>
          <tr>
            <th>ID</th> {/* Added ID column */}
            <th>Title</th>
            <th>Date</th>
            <th>Venue</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map(row => (
            <tr key={row.id}>
              <td>{row.id}</td> {/* Show ID */}
              <td>
                {editId===row.id ? (
                  <input defaultValue={row.title} onChange={e=>row.title=e.target.value}/>
                ) : row.title}
              </td>
              <td>
                {editId===row.id ? (
                  <input type="date" defaultValue={row.date||''} onChange={e=>row.date=e.target.value}/>
                ) : (row.date || '')}
              </td>
              <td>
                {editId===row.id ? (
                  <select defaultValue={row.venue_id || ''} onChange={e=>row.venue_id=e.target.value}>
                    <option value="">Select Venue</option>
                    {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                ) : (row.venue_name || '')}
              </td>
              <td>
                {editId===row.id ? (
                  <input defaultValue={row.description||''} onChange={e=>row.description=e.target.value}/>
                ) : (row.description || '')}
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
