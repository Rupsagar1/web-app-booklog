import { db, auth } from "./firebase-config.js";
import { 
    collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const booksCollection = collection(db, "books");

const bookForm = document.getElementById("bookForm");
const booksList = document.getElementById("booksList");
const filterGenre = document.getElementById("filterGenre");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");
const editIndex = document.getElementById("editIndex");
const notification = document.getElementById("notification");

function showNotification(message, type = "success") {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => notification.classList.remove("show"), 3000);
}

async function fetchBooks() {
    booksList.innerHTML = ""; 
    const querySnapshot = await getDocs(booksCollection);
    
    querySnapshot.forEach((doc) => {
        const book = doc.data();
        const bookCard = document.createElement("div");
        bookCard.className = "book-card";
        bookCard.innerHTML = `
            <h3>${book.title}</h3>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>Genre:</strong> ${book.genre}</p>
            <p><strong>Rating:</strong> ${"★".repeat(book.rating)}${"☆".repeat(5 - book.rating)}</p>
            <div class="book-actions">
                <button class="edit-btn" onclick='editBook("${doc.id}", "${book.title}", "${book.author}", "${book.genre}", ${book.rating})'>✎</button>
                <button class="delete-btn" onclick="deleteBook('${doc.id}')">×</button>
            </div>
        `;
        booksList.appendChild(bookCard);
    });
}

bookForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const genre = document.getElementById("genre").value;
    const rating = document.querySelector('input[name="rating"]:checked')?.value;

    if (!title || !author || !genre || !rating) {
        showNotification("Please fill out all fields.", "error");
        return;
    }

    if (editIndex.value === "") {
        await addDoc(booksCollection, { title, author, genre, rating: Number(rating) });
        showNotification("Book added successfully!");
    } else {
        const bookRef = doc(db, "books", editIndex.value);
        await updateDoc(bookRef, { title, author, genre, rating: Number(rating) });
        showNotification("Book updated successfully!");
        resetForm();
    }

    bookForm.reset();
    fetchBooks();
});

window.editBook = async (id, title, author, genre, rating) => {
    document.getElementById("title").value = title;
    document.getElementById("author").value = author;
    document.getElementById("genre").value = genre;
    document.querySelector(`input[name="rating"][value="${rating}"]`).checked = true;

    editIndex.value = id; 
    formTitle.textContent = "Edit Book";
    submitBtn.textContent = "Update Book";
    cancelBtn.style.display = "block"; 
};

window.deleteBook = async (id) => {
    if (confirm("Are you sure you want to delete this book?")) {
        await deleteDoc(doc(db, "books", id));
        showNotification("Book deleted successfully!", "error");
        fetchBooks(); 
    }
};

function resetForm() {
    editIndex.value = ""; 
    formTitle.textContent = "Add New Book";
    submitBtn.textContent = "Add Book"; 
    cancelBtn.style.display = "none"; 
    bookForm.reset(); 
}

cancelBtn.addEventListener("click", resetForm);

filterGenre.addEventListener("change", async (e) => {
    const selectedGenre = e.target.value;
    booksList.innerHTML = "";

    const querySnapshot = await getDocs(booksCollection);
    querySnapshot.forEach((doc) => {
        const book = doc.data();
        if (selectedGenre === "all" || book.genre === selectedGenre) {
            const bookCard = document.createElement("div");
            bookCard.className = "book-card";
            bookCard.innerHTML = `
                <h3>${book.title}</h3>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Genre:</strong> ${book.genre}</p>
                <p><strong>Rating:</strong> ${"★".repeat(book.rating)}${"☆".repeat(5 - book.rating)}</p>
                <div class="book-actions">
                    <button class="edit-btn" onclick='editBook("${doc.id}", "${book.title}", "${book.author}", "${book.genre}", ${book.rating})'>✎</button>
                    <button class="delete-btn" onclick="deleteBook('${doc.id}')">×</button>
                </div>
            `;
            booksList.appendChild(bookCard);
        }
    });
});

document.getElementById("logout").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    }).catch((error) => {
        showNotification(error.message, "error");
    });
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchBooks();
    } else {
        window.location.href = "login.html";
    }
});
