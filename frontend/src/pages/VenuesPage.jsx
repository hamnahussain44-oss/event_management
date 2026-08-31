import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../utils/constants';

export default function VenuesPage(){
  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({ name:'', address:'', capacity:'' });
  const [editId, setEditId] = useState(null);

  const load = async () => {
    const vs = await fetch(`${API_BASE_URL}/venues`).then(r=>r.json());
    setVenues(vs);
  };
  useEffect(()=>{ load(); },[]);

  const onChange = e => setForm(f => ({...f, [e.target.name]: e.target.value}));

  const create = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/venues`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name: form.name, address: form.address, capacity: Number(form.capacity)||0 })
    });
    const created = await res.json();
    setVenues(prev => [created, ...prev]);
    setForm({ name:'', address:'', capacity:'' });
  };

  const save = async (id, row) => {
    const res = await fetch(`${API_BASE_URL}/venues/${id}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name: row.name, address: row.address, capacity: Number(row.capacity)||0 })
    });
    const updated = await res.json();
    setVenues(prev => prev.map(v => v.id===id? updated : v));
    setEditId(null);
  };

  const remove = async (id) => {
    await fetch(`${API_BASE_URL}/venues/${id}`, { method:'DELETE' });
    setVenues(prev => prev.filter(v => v.id!==id));
  };

  return (
    <div>
      <h2>Venues</h2>
      <form className="inline" onSubmit={create}>
        <input name="name" placeholder="Name" value={form.name} onChange={onChange} required />
        <input name="address" placeholder="Address" value={form.address} onChange={onChange} />
        <input name="capacity" placeholder="Capacity" value={form.capacity} onChange={onChange} />
        <button className="primary" type="submit">Add</button>
      </form>

      <table className="table" style={{marginTop:'1rem'}}>
        <thead>
          <tr>
            <th>ID</th> {/* NEW */}
            <th>Name</th>
            <th>Address</th>
            <th>Capacity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {venues.map(row => (
            <tr key={row.id}>
              <td>{row.id}</td> {/* NEW */}
              <td>
                {editId===row.id ? (
                  <input defaultValue={row.name} onChange={e=>row.name=e.target.value}/>
                ) : row.name}
              </td>
              <td>
                {editId===row.id ? (
                  <input defaultValue={row.address||''} onChange={e=>row.address=e.target.value}/>
                ) : (row.address || '')}
              </td>
              <td>
                {editId===row.id ? (
                  <input defaultValue={row.capacity||0} onChange={e=>row.capacity=e.target.value}/>
                ) : (row.capacity ?? 0)}
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
