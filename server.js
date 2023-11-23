const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001
const dbFilePath = path.join(__dirname, 'Develop', 'db', 'db.json');

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'Develop', 'public')));

//checking if db exists and creating if not
fs.access(dbFilePath)
  .catch(() => fs.writeFile(dbFilePath, '[]'))
  .then(() => {
    console.log('Database file ready.');
  })
  .catch((err) => {
    console.error('Error creating database file:', err);
  });


//route for Notes
app.get('/notes', (req, res) => {
    console.log('testing getting notes');
    res.sendFile(path.join(__dirname, 'Develop', 'public', 'notes.html'));
  });

// Handle GET request to retrieve notes
app.get('/api/notes', (req, res) => {
    console.log('testing retrieving notes');
    fs.readFile(dbFilePath, 'utf8')
      .then((data) => {
        const notes = JSON.parse(data);
        res.json(notes);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });

//save notes
app.post('/api/notes', express.json(), async (req, res) => {
    try {
      const { title, text } = req.body;
  
      if (!title || !text) {
        return res.status(400).json({ error: 'Title and text are required' });
      }
  
      const data = await fs.readFile(dbFilePath, 'utf8');
      const notes = JSON.parse(data);
      const newNote = { id: uuidv4(), title, text };
      notes.push(newNote);
  
      await fs.writeFile(dbFilePath, JSON.stringify(notes, null, 2));
      res.status(201).json(newNote);
      console.log('testing saving notes');
    } catch (err) {
      console.error('Error saving note:', err);
      res.status(500).json({ error: 'Failed to save note' });
    }
  });

//delete notes
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    fs.readFile(dbFilePath, 'utf8')
      .then((data) => {
        const notes = JSON.parse(data);
        const updatedNotes = notes.filter((note) => note.id !== noteId);
  
        return fs.writeFile(dbFilePath, JSON.stringify(updatedNotes, null, 2));
      })
      .then(() => {
        res.json(`Item ${noteId} has been deleted 🗑️`);
        console.log('testing deleting notes');
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  });


//start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
