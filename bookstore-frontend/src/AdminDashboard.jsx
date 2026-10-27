import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import "./AdminDashboard.css";

const API_URL = "http://localhost:8080";

const emptyBook = {
  title: "",
  author: "",
  price: "",
};

export default function AdminDashboard() {
  const { user, basicToken, logout } = useAuth();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyBook);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Basic ${basicToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || `Request failed: HTTP ${response.status}`);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  async function loadBooks() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/api/books");
      const list = Array.isArray(data) ? data : data?.content ?? [];
      setBooks(list);
    } catch (err) {
      setError(err.message || "Unable to load books.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user && basicToken) {
      loadBooks();
    } else {
      setLoading(false);
    }
  }, [user, basicToken]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function startEdit(book) {
    setEditingId(book.id);
    setForm({
      title: book.title ?? "",
      author: book.author ?? "",
      price: String(book.price ?? ""),
    });
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyBook);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const price = Number(form.price);

    if (!form.title.trim() || !form.author.trim()) {
      setError("Enter both the book title and author.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        author: form.author.trim(),
        price,
      };

      if (editingId !== null) {
        await apiRequest(`/api/books/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMessage("Book updated successfully.");
      } else {
        await apiRequest("/api/books", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Book added successfully.");
      }

      resetForm();
      await loadBooks();
    } catch (err) {
      setError(
        err.message ||
          "Could not save the book. Check your administrator permissions."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteBook(book) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await apiRequest(`/api/books/${book.id}`, {
        method: "DELETE",
      });

      setBooks((previous) =>
        previous.filter((item) => item.id !== book.id)
      );

      if (editingId === book.id) resetForm();

      setMessage("Book deleted successfully.");
    } catch (err) {
      setError(
        err.message ||
          "Could not delete the book. It may be restricted by the backend."
      );
    }
  }

  const filteredBooks = books.filter((book) => {
    const query = search.toLowerCase();

    return (
      String(book.title ?? "").toLowerCase().includes(query) ||
      String(book.author ?? "").toLowerCase().includes(query)
    );
  });

  if (!user) {
    return (
      <main className="admin-page">
        <section className="admin-panel admin-login-prompt">
          <h1>Administrator sign-in required</h1>
          <p>Sign in with your administrator account to manage books.</p>
          <button onClick={() => navigate("/login")}>Sign in</button>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <div>
          <span className="admin-eyebrow">BOOKHAVEN MANAGEMENT</span>
          <h1>Admin Dashboard</h1>
          <p>Manage your bookstore catalogue.</p>
        </div>

        <button
          className="admin-secondary-button"
          onClick={() => navigate("/")}
        >
          View Store
        </button>
      </header>

      <section className="admin-stats">
        <article className="admin-stat-card">
          <span>Total books loaded</span>
          <strong>{books.length}</strong>
        </article>

        <article className="admin-stat-card">
          <span>Catalogue status</span>
          <strong className="admin-status">Connected</strong>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-section-heading">
          <div>
            <h2>{editingId !== null ? "Edit book" : "Add a new book"}</h2>
            <p>
              {editingId !== null
                ? `Editing book #${editingId}`
                : "Enter the details to add a book to your catalogue."}
            </p>
          </div>
        </div>

        <form className="admin-book-form" onSubmit={handleSubmit}>
          <label>
            Book title
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Java Programming"
              maxLength={200}
              required
            />
          </label>

          <label>
            Author
            <input
              name="author"
              value={form.author}
              onChange={handleChange}
              placeholder="e.g. James Gosling"
              maxLength={150}
              required
            />
          </label>

          <label>
            Price (₹)
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="499"
              min="0.01"
              step="0.01"
              required
            />
          </label>

          <div className="admin-form-actions">
            <button className="admin-primary-button" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Save changes"
                  : "Add book"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="admin-secondary-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="admin-alert admin-alert-error" role="alert">
            {error}
          </div>
        )}

        {message && (
          <div className="admin-alert admin-alert-success" role="status">
            {message}
          </div>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-section-heading admin-catalogue-heading">
          <div>
            <h2>Book catalogue</h2>
            <p>View, search, edit, and delete books.</p>
          </div>

          <button
            className="admin-secondary-button"
            onClick={loadBooks}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <input
          className="admin-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title or author..."
        />

        {loading ? (
          <p className="admin-empty">Loading books...</p>
        ) : filteredBooks.length === 0 ? (
          <p className="admin-empty">
            {error ? "Unable to load the catalogue." : "No books found."}
          </p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Book</th>
                  <th>Author</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id}>
                    <td>#{book.id}</td>
                    <td className="admin-book-title">{book.title}</td>
                    <td>{book.author}</td>
                    <td>₹{Number(book.price).toFixed(2)}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          className="admin-edit-button"
                          onClick={() => startEdit(book)}
                        >
                          Edit
                        </button>

                        <button
                          className="admin-delete-button"
                          onClick={() => deleteBook(book)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}