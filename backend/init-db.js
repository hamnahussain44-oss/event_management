const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS venues(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    capacity INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS events(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT,
    venue_id INTEGER,
    description TEXT,
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS attendees(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS event_attendees(
    attendee_id INTEGER,
    event_id INTEGER,
    PRIMARY KEY(attendee_id, event_id),
    FOREIGN KEY(attendee_id) REFERENCES attendees(id),
    FOREIGN KEY(event_id) REFERENCES events(id)
  )`);

  db.get("SELECT COUNT(*) as c FROM venues", (err, row) => {
    if (row && row.c === 0) {
      db.run("INSERT INTO venues(name,address,capacity) VALUES (?,?,?)",
        ['Main Hall','123 College Rd',200]);
    }
  });

  console.log("Database initialized.");
});

db.close();
