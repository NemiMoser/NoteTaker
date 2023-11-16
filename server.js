const express = require('express');
const app = express();
const path = require('path');
const fs = require ('fs/promises');


//base URL
const basePath = process.env.NODE_ENV === 'production' ? '/miniature-eureka' : '';
//middleware
app.use(basePath, express.static(path.join(__dirname, 'Develop', 'public')));


//route for Notes
app.get(basePath + '/notes', (req, res) => {
    res.sendFile('notes.html', { root: path.join(__dirname, 'Develop', 'public') });
});

//save notes
app.post('/api/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './Develop/public/notes.html'));
});

//delete notes
app.delete('/api/notes:id', (req, res) => {
    const noteId = req.params.id;
    fs.readFile('./db.json', 'utf8')
    .then((data) => {
        const notes = JSON.parse(data);
        const updatedNotes = notes.filter((note) => note.id !== noteId);

        return fs.writeFile('./db.json', JSON. stringify(updatedNotes, null, 2));
    })
    .then(() => {
        res.json(`Item ${noteId} has been deleted 🗑️`)
    })
    .catch((err) => {
        res.status(500).json({ error: err.message });
    });
});


//start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});