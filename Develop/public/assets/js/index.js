const noteForm = document.querySelector('.note-form');
const noteTitle = document.querySelector('.note-title');
const noteText = document.querySelector('.note-textarea');
const saveNoteBtn = document.querySelector('.save-note-btn');
const newNoteBtn = document.querySelector('.new-note-btn');
const clearBtn = document.querySelector('.clear-form-btn');
const noteList = document.querySelector('#list-group');

// Show an element
const show = (elem) => {
  elem.style.display = 'block';
};

// Hide an element
const hide = (elem) => {
  elem.style.display = 'none';
};


// activeNote used to keep track of the note in the textarea
let activeNote = {};


  //deleting from server
  const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Error deleting note:', error);
    });


    const renderActiveNote = () => {
      hide(saveNoteBtn);
      hide(clearBtn);

      if (activeNote.id) {
        show(newNoteBtn);
        noteTitle.setAttribute('readonly', true);
        noteText.setAttribute('readonly', true);
        noteTitle.value = activeNote.title;
        noteText.value = activeNote.text;
      } else {
        hide(newNoteBtn);
        noteTitle.removeAttribute('readonly');
        noteText.removeAttribute('readonly');
        noteTitle.value = '';
        noteText.value = '';
      }
    };

    const handleNoteSave = () => {
      const newNote = {
        title: noteTitle.value,
        text: noteText.value,
      };
      saveNote(newNote)
        .then(getAndRenderNotes)
        .then(renderActiveNote);
    };

// Delete the clicked note
const handleNoteDelete = (e) => {
  e.stopPropagation();
  const noteId = JSON.parse(e.target.parentElement.dataset.note).id;

  if (activeNote.id === noteId) {
    activeNote = {};
  }

  deleteNote(noteId)
    .then(() => getAndRenderNotes())
    .then(() => renderActiveNote());
};

// Sets the activeNote and displays it
const handleNoteView = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.parentElement.dataset.note);
  renderActiveNote();
};

const handleNewNoteView = (e) => {
  activeNote = {};
  show(clearBtn);
  renderActiveNote();
};

  // Returns HTML element with or without a delete button
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = text;
    spanEl.addEventListener('click', handleNoteView);

    liEl.appendChild(spanEl);

    if (delBtn) {
    const delBtnEl = document.createElement('i');
    delBtnEl.classList.add(
      'fas',
      'fa-trash-alt',
      'float-right',
      'text-danger',
      'delete-note'
    );
    delBtnEl.addEventListener('click', () => {
      const noteId = JSON.parse(liEl.dataset.note).id;
      deleteNote(noteId)
        .then(() => getAndRenderNotes())
        .then(() => renderActiveNote());
    });

    liEl.appendChild(delBtnEl);
  }

  return liEl;
};

  const handleRenderBtns = () => {
    show(clearBtn);
    if (!noteTitle.value.trim() && !noteText.value.trim()) {
      hide(clearBtn);
    } else if (!noteTitle.value.trim() || !noteText.value.trim()) {
      hide(saveNoteBtn);
    } else {
      show(saveNoteBtn);
    }
  };


function addToNoteList(noteList) {
  noteHistory.unshift(noteList);

  updateNoteListUI();
}

const getAndRenderNotes = () => {
  return getNotes()
    .then(renderNoteList)
    .catch((error) => console.error('Error getting and rendering notes:', error));
};

const renderNoteList = (notes) => {
  updateNoteListUI(notes);
};

const updateNoteListUI = (notes) => {
  const ul = document.getElementById('list-group');
  ul.innerHTML = '';

  if (notes.length === 0) {
    ul.appendChild(createLi('No saved Notes', false));
  } else {
    notes.forEach((note) => {
      const li = createLi(note.title);
      li.dataset.note = JSON.stringify(note);
      ul.appendChild(li);
    });
  }
};

const getNotes = () =>
  fetch('/api/notes')
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error fetching notes:', error);
      return [];
    });

      //save to server
  const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to save note');
      }
      return getAndRenderNotes();
    });


// Event listeners
if (window.location.pathname === '/notes') {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  clearBtn.addEventListener('click', renderActiveNote);
  noteForm.addEventListener('input', handleRenderBtns);
}

getAndRenderNotes();