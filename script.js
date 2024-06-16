let currentPage = 1;
const notesPerPage = 6;

function showPopup(action, noteId = null) {
  const popupContainer = document.getElementById('popupContainer');
  const popupTitle = document.getElementById('popupTitle');
  const submitBtn = document.getElementById('submitBtn');
  const noteTitle = document.getElementById('note-title');
  const noteText = document.getElementById('note-text');
  const colorOptions = document.querySelectorAll('.color-options span');
  const colorPrompt = document.getElementById('color-prompt');

  noteTitle.value = '';
  noteText.value = '';
  resetColorOptions();

  if (action === 'edit') {
    popupTitle.textContent = 'Edit Note';
    submitBtn.textContent = 'Update Note';
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const noteToEdit = notes.find(note => note.id === noteId);
    noteTitle.value = noteToEdit ? noteToEdit.title : '';
    noteText.value = noteToEdit ? noteToEdit.text : '';
    setNoteColor(noteToEdit.colorClass);
    submitBtn.onclick = () => updateNote(noteId);
  } else {
    popupTitle.textContent = 'New Note';
    submitBtn.textContent = 'Create Note';
    submitBtn.onclick = createNote;
  }

  colorPrompt.style.display = 'block';

  popupContainer.classList.remove('hidden');

  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      resetColorOptions();
      option.classList.add('selected');
      colorPrompt.style.display = 'none';
    });
  });
}

function resetColorOptions() {
  const colorOptions = document.querySelectorAll('.color-options span');
  colorOptions.forEach(option => {
    option.classList.remove('selected');
  });
}

function setNoteColor(colorClass) {
  const colorOptions = document.querySelectorAll('.color-options span');
  colorOptions.forEach(option => {
    if (option.classList.contains(colorClass)) {
      option.classList.add('selected');
    }
  });
}

function createNote() {
  const noteTitle = document.getElementById('note-title').value.trim();
  const noteText = document.getElementById('note-text').value.trim();
  const selectedColor = document.querySelector('.color-options span.selected')?.getAttribute('data-color');

  if (!selectedColor) {
    document.getElementById('color-prompt').style.display = 'block';
    return;
  }

  if (noteText) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const noteId = Date.now();
    const note = {
      id: noteId,
      title: noteTitle,
      text: noteText,
      colorClass: `note-color-${selectedColor}`,
      favorite: false,
      pinned: false
    };
    notes.push(note);

    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
    closePopup();
  }
}

function updateNote(noteId) {
  const noteTitle = document.getElementById('note-title').value.trim();
  const noteText = document.getElementById('note-text').value.trim();
  const selectedColor = document.querySelector('.color-options span.selected')?.getAttribute('data-color');

  if (!selectedColor) {
    document.getElementById('color-prompt').style.display = 'block';
    return;
  }

  if (noteText) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const noteToUpdate = notes.find(note => note.id === noteId);
    noteToUpdate.title = noteTitle;
    noteToUpdate.text = noteText;
    noteToUpdate.colorClass = `note-color-${selectedColor}`;

    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
    closePopup();
  }
}

function closePopup() {
  document.getElementById('popupContainer').classList.add('hidden');
}

function displayNotes(filter = null) {
  const notesList = document.getElementById('notes-list');
  notesList.innerHTML = '';
  let notes = JSON.parse(localStorage.getItem('notes')) || [];

  if (filter === 'favorites') {
    notes = notes.filter(note => note.favorite);
    if (notes.length === 0) {
      notesList.innerHTML = '<li>No notes are favorited.</li>';
      return;
    }
  } else if (filter === 'pinned') {
    notes = notes.filter(note => note.pinned);
    if (notes.length === 0) {
      notesList.innerHTML = '<li>No notes are pinned.</li>';
      return;
    }
  }

  const pinnedNotes = notes.filter(note => note.pinned);
  const unpinnedNotes = notes.filter(note => !note.pinned);
  notes = [...pinnedNotes, ...unpinnedNotes];

  const startIndex = (currentPage - 1) * notesPerPage;
  const endIndex = startIndex + notesPerPage;
  const paginatedNotes = notes.slice(startIndex, endIndex);

  paginatedNotes.forEach(note => {
    const li = document.createElement('li');
    li.className = `note-item ${note.colorClass}`;
    li.innerHTML = `
      <div class="note-actions">
        <button class="favorite-icon ${note.favorite ? 'favorited' : ''}" onclick="toggleFavorite(${note.id})"><i class="fas fa-star"></i></button>
        <button class="pin-icon ${note.pinned ? 'pinned' : ''}" onclick="togglePin(${note.id})"><i class="fas fa-thumbtack"></i></button>
        <button class="edit-icon" onclick="showPopup('edit', ${note.id})"><i class="fas fa-edit"></i></button>
        <button class="delete-icon" onclick="deleteNote(${note.id})"><i class="fas fa-trash-alt"></i></button>
      </div>
      <div class="note-content">
        <div class="note-title">${note.title}</div>
        <div class="note-body">${note.text}</div>
      </div>
    `;
    notesList.appendChild(li);
  });

  updatePagination();
}

function deleteNote(noteId) {
  let notes = JSON.parse(localStorage.getItem('notes')) || [];
  notes = notes.filter(note => note.id !== noteId);
  localStorage.setItem('notes', JSON.stringify(notes));
  displayNotes();
}

function toggleFavorite(noteId) {
  let notes = JSON.parse(localStorage.getItem('notes')) || [];
  const note = notes.find(note => note.id === noteId);
  if (note) {
    note.favorite = !note.favorite;
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
  }
}

function togglePin(noteId) {
  let notes = JSON.parse(localStorage.getItem('notes')) || [];
  const note = notes.find(note => note.id === noteId);
  if (note) {
    note.pinned = !note.pinned;
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
  }
}

function displayAllNotes() {
  currentPage = 1;
  displayNotes();
}

function displayFavoriteNotes() {
  currentPage = 1;
  displayNotes('favorites');
}

function displayPinnedNotes() {
  currentPage = 1;
  displayNotes('pinned'); // Update to filter and display only pinned notes
}

function changePage(direction) {
  currentPage += direction;
  displayNotes();
}

function updatePagination() {
  const notes = JSON.parse(localStorage.getItem('notes')) || [];
  const totalPages = Math.ceil(notes.length / notesPerPage);
  const prevBtn = document.getElementById('pagination-prev');
  const nextBtn = document.getElementById('pagination-next');

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Initial display
displayAllNotes();

