const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./data.db');

function run(sql, params = []){
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err){
      if (err) reject(err); else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}
function get(sql, params = []){
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err); else resolve(row);
    });
  });
}
function all(sql, params = []){
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err); else resolve(rows);
    });
  });
}

// Basic login (demo)
app.post('/api/login', (req,res) => {
  const { username } = req.body;
  if(!username) return res.status(400).json({error:'username required'});
  res.json({ token: 'demo-token', username });
});

// Venues CRUD
app.get('/api/venues', async (req,res) => {
  const rows = await all("SELECT * FROM venues ORDER BY id DESC");
  res.json(rows);
});
app.post('/api/venues', async (req,res) => {
  const { name, address, capacity=0 } = req.body;
  const result = await run("INSERT INTO venues(name,address,capacity) VALUES (?,?,?)",[name,address,capacity]);
  const row = await get("SELECT * FROM venues WHERE id=?", [result.id]);
  res.status(201).json(row);
});
app.put('/api/venues/:id', async (req,res) => {
  const id = req.params.id;
  const { name, address, capacity=0 } = req.body;
  await run("UPDATE venues SET name=?, address=?, capacity=? WHERE id=?", [name,address,capacity,id]);
  const row = await get("SELECT * FROM venues WHERE id=?", [id]);
  if(!row) return res.status(404).json({error:'Not found'});
  res.json(row);
});
app.delete('/api/venues/:id', async (req,res) => {
  const id = req.params.id;
  await run("DELETE FROM venues WHERE id=?", [id]);
  res.status(204).end();
});

// Events CRUD
app.get('/api/events', async (req,res) => {
  const rows = await all(`SELECT e.*, v.name as venue_name 
                          FROM events e LEFT JOIN venues v ON e.venue_id=v.id
                          ORDER BY e.id DESC`);
  res.json(rows);
});
app.post('/api/events', async (req,res) => {
  const { title, date, venueId, description } = req.body;
  const result = await run("INSERT INTO events(title,date,venue_id,description) VALUES (?,?,?,?)",
    [title, date || null, venueId || null, description || null]);
  const row = await get("SELECT e.*, v.name as venue_name FROM events e LEFT JOIN venues v ON e.venue_id=v.id WHERE e.id=?", [result.id]);
  res.status(201).json(row);
});
app.put('/api/events/:id', async (req,res) => {
  const id = req.params.id;
  const { title, date, venueId, description } = req.body;
  await run("UPDATE events SET title=?, date=?, venue_id=?, description=? WHERE id=?",
    [title, date || null, venueId || null, description || null, id]);
  const row = await get("SELECT e.*, v.name as venue_name FROM events e LEFT JOIN venues v ON e.venue_id=v.id WHERE e.id=?", [id]);
  if(!row) return res.status(404).json({error:'Not found'});
  res.json(row);
});
app.delete('/api/events/:id', async (req,res) => {
  const id = req.params.id;
  await run("DELETE FROM events WHERE id=?", [id]);
  await run("DELETE FROM event_attendees WHERE event_id=?", [id]);
  res.status(204).end();
});

// Attendees CRUD
app.get('/api/attendees', async (req,res) => {
  const rows = await all("SELECT * FROM attendees ORDER BY id DESC");
  for(const r of rows){
    const evs = await all("SELECT event_id FROM event_attendees WHERE attendee_id=?", [r.id]);
    r.eventIds = evs.map(e => e.event_id);
  }
  res.json(rows);
});
app.post('/api/attendees', async (req,res) => {
  const { name, email, eventIds = [] } = req.body;
  const result = await run("INSERT INTO attendees(name,email) VALUES (?,?)", [name, email]);
  for(const eid of eventIds){
    await run("INSERT OR IGNORE INTO event_attendees(attendee_id,event_id) VALUES (?,?)",[result.id, eid]);
  }
  const row = await get("SELECT * FROM attendees WHERE id=?", [result.id]);
  const evs = await all("SELECT event_id FROM event_attendees WHERE attendee_id=?", [result.id]);
  row.eventIds = evs.map(e => e.event_id);
  res.status(201).json(row);
});
app.put('/api/attendees/:id', async (req,res) => {
  const id = req.params.id;
  const { name, email, eventIds = [] } = req.body;
  await run("UPDATE attendees SET name=?, email=? WHERE id=?", [name, email, id]);
  await run("DELETE FROM event_attendees WHERE attendee_id=?", [id]);
  for(const eid of eventIds){
    await run("INSERT OR IGNORE INTO event_attendees(attendee_id,event_id) VALUES (?,?)",[id, eid]);
  }
  const row = await get("SELECT * FROM attendees WHERE id=?", [id]);
  if(!row) return res.status(404).json({error:'Not found'});
  const evs = await all("SELECT event_id FROM event_attendees WHERE attendee_id=?", [id]);
  row.eventIds = evs.map(e => e.event_id);
  res.json(row);
});
app.delete('/api/attendees/:id', async (req,res) => {
  const id = req.params.id;
  await run("DELETE FROM event_attendees WHERE attendee_id=?", [id]);
  await run("DELETE FROM attendees WHERE id=?", [id]);
  res.status(204).end();
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Backend (SQLite) on http://localhost:${PORT}`));
