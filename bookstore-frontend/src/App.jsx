import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./App.css";

const API = "http://localhost:8080/api";
const BOOKS_API = `${API}/books`;
const CART_API = `${API}/cart/items`;

const categories = [
  "All Books",
  "Self Growth",
  "Technology",
  "Finance",
  "Fiction",
  "Productivity",
  "Discover",
];

function App() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Books");

  const [cartCount, setCartCount] = useState(0);
  const [apiConnected, setApiConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingBookId, setAddingBookId] = useState(null);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState(false);

  const { user, basicToken, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin =
    user?.role === "ADMIN" ||
    user?.email?.toLowerCase() === "admin";

  // Load the actual cart quantity from the backend.
  async function loadCartCount() {
    if (!user || !basicToken) {
      setCartCount(0);
      return;
    }

    try {
      const response = await fetch(`${API}/cart`, {
        headers: {
          Authorization: `Basic ${basicToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Could not load cart: HTTP ${response.status}`);
      }

      const data = await response.json();

      // Support either a list or an object containing cart items.
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.items)
          ? data.items
          : [];

      const totalQuantity = items.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      );

      setCartCount(totalQuantity);
    } catch (err) {
      console.error("Could not load cart count:", err);
    }
  }

  // Reload the cart when authentication changes.
  useEffect(() => {
    loadCartCount();
  }, [user, basicToken]);

  // Load books from the Spring Boot backend.
  async function loadBooks(signal) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(BOOKS_API, { signal });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      // Spring Boot pagination returns books in data.content.
      const list = Array.isArray(data) ? data : data.content;

      if (!Array.isArray(list)) {
        throw new Error("The server returned an invalid book list.");
      }

      setBooks(
        list.map((book) => ({
          ...book,
          category: book.category || "Discover",
          emoji: "📚",
          color: "#e9e3d9",
        }))
      );

      setApiConnected(true);
    } catch (err) {
      if (err.name === "AbortError") {
        return;
      }

      console.error("Could not load books:", err);
      setApiConnected(false);

      setError(
        "We couldn't load books from the server. Please check that your backend is running and try again."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  // Load books when the homepage opens.
  useEffect(() => {
    const controller = new AbortController();

    loadBooks(controller.signal);

    return () => controller.abort();
  }, []);

  // Add one book to the logged-in customer's real cart.
  async function addToCart(bookId) {
    setCartMessage("");
    setCartError(false);

    if (!user || !basicToken) {
      navigate("/login");
      return;
    }

    try {
      setAddingBookId(bookId);

      const response = await fetch(CART_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${basicToken}`,
        },
        body: JSON.stringify({
          bookId,
          quantity: 1,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Your session may have expired, or your account does not have permission to use the cart. Please log in again."
        );
      }

      if (!response.ok) {
        const responseText = await response.text();

        throw new Error(
          responseText || `Could not add the book (HTTP ${response.status}).`
        );
      }

      // Get the updated quantity from the backend.
      await loadCartCount();

      setCartMessage("Book added to your cart successfully! ✓");
    } catch (err) {
      console.error("Add to cart failed:", err);
      setCartError(true);

      setCartMessage(
        err.message || "Could not add this book. Please try again."
      );
    } finally {
      setAddingBookId(null);
    }
  }

  // Search by title or author and filter by category.
  const filteredBooks = books.filter((book) => {
    const query = search.toLowerCase().trim();

    const matchesSearch = `${book.title} ${book.author}`
      .toLowerCase()
      .includes(query);

    const matchesCategory =
      category === "All Books" || book.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="site-shell">
      {/* Announcement bar */}
      <div className="announcement">
        A LITTLE SOMETHING FOR YOUR NEXT CHAPTER
        <span>✳</span>
        FREE SHIPPING ON YOUR DREAMS
      </div>

      {/* Navigation */}
      <header className="navbar">
        <Link className="brand" to="/" aria-label="Bookhaven home">
          <span className="brand-icon">b.</span>

          <span>
            book<span className="brand-accent">haven</span>
            <small>YOUR NEXT CHAPTER STARTS HERE</small>
          </span>
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <a href="#catalog">Explore books</a>
          <a href="#about">Our story</a>

          {user && (
            <>
              <Link to="/cart">My Cart</Link>
              <Link to="/orders">My Orders</Link>
            </>
          )}

          {user && isAdmin && (
            <Link to="/admin">Admin Dashboard</Link>
          )}
        </nav>

        <div className="nav-actions">
          <button
            className="icon-button"
            type="button"
            aria-label="Search books"
            onClick={() =>
              document.querySelector("#book-search")?.focus()
            }
          >
            ⌕
          </button>

          <button
            className="cart-button"
            type="button"
            onClick={() => navigate(user ? "/cart" : "/login")}
          >
            ♧ <span>Bag</span>
            <b>{cartCount}</b>
          </button>

          {user ? (
            <>
              <span className="user-label">
                {isAdmin ? "Admin" : user.email}
              </span>

              <button
                className="auth-nav-button"
                type="button"
                onClick={() => {
                  logout();
                  setCartCount(0);
                  navigate("/", { replace: true });
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="auth-nav-button" to="/login">
                Login
              </Link>

              <Link className="auth-nav-button" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      <main>
        {/* Hero section */}
        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              THE ART OF GETTING LOST IN A BOOK
            </div>

            <h1>
              Find your next
              <br />
              <em>favorite</em> chapter.
            </h1>

            <p className="hero-description">
              Stories that stay with you. Ideas that change you.
              Your next great read is closer than you think.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#catalog">
                Explore the collection <span>↗</span>
              </a>

              <a className="text-button" href="#catalog">
                Find your kind of story <span>→</span>
              </a>
            </div>

            <div className="reader-note">
              <div className="reader-avatars">
                <span>J</span>
                <span>A</span>
                <span>M</span>
                <span>+</span>
              </div>

              <div>
                <strong>A community of curious minds</strong>
                <small>Good books. Better conversations.</small>
              </div>
            </div>
          </div>

          {/* Decorative book illustration */}
          <div className="hero-art">
            <div className="art-sun" />

            <div className="art-caption">
              A WORLD
              <br />
              BETWEEN
              <br />
              THE COVERS.
            </div>

            <div className="floating-star star-one">✳</div>
            <div className="floating-star star-two">✳</div>

            <div className="hero-book book-back">
              <div className="book-decoration">✳</div>
              <span>
                THE
                <br />
                QUIET
                <br />
                MIND
              </span>
              <small>A FIELD GUIDE TO STILLNESS</small>
            </div>

            <div className="hero-book book-front">
              <div className="front-top">BOOKHAVEN EDITION · Nº 01</div>
              <div className="front-art">❋</div>
              <span>
                THE ART
                <br />
                OF <em>BEGINNING</em>
                <br />
                AGAIN.
              </span>
              <small>AN INVITATION TO EXPLORE</small>
            </div>

            <div className="art-bottom-note">
              COLLECT MOMENTS, NOT JUST BOOKS <span>↗</span>
            </div>
          </div>
        </section>

        {/* Store benefits */}
        <section className="benefits">
          <div>
            <span>✳</span>
            <p>
              <strong>Thoughtfully picked</strong>
              <small>Every book has a story worth telling</small>
            </p>
          </div>

          <div>
            <span>♡</span>
            <p>
              <strong>For every kind of reader</strong>
              <small>From curious minds to avid readers</small>
            </p>
          </div>

          <div>
            <span>↗</span>
            <p>
              <strong>Your next obsession</strong>
              <small>One good read away</small>
            </p>
          </div>
        </section>

        {/* Book catalogue */}
        <section className="catalog section-pad" id="catalog">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" />
                THE BOOKSHELF
              </div>

              <h2>
                A good place to <em>start.</em>
              </h2>
            </div>

            <span className="book-count">
              {loading
                ? "LOADING BOOKS..."
                : `${filteredBooks.length} BOOKS TO DISCOVER`}
            </span>
          </div>

          {/* Search and category controls */}
          <div className="catalog-controls">
            <div className="search-wrap">
              <span>⌕</span>

              <input
                id="book-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search a title, author, or feeling..."
                aria-label="Search books by title or author"
              />
            </div>

            <div className="category-list">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={
                    category === item ? "category active" : "category"
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Connection status */}
          {apiConnected && (
            <div className="connection-status" role="status">
              ● Connected to your bookstore database
            </div>
          )}

          {/* Cart feedback */}
          {cartMessage && (
            <div
              className="connection-status"
              role="status"
              style={{
                color: cartError ? "#b42318" : "#31543b",
              }}
            >
              {cartMessage}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="empty-state" role="status">
              Loading books from your database...
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="empty-state" role="alert">
              <p>{error}</p>

              <button type="button" onClick={() => loadBooks()}>
                Try again
              </button>
            </div>
          )}

          {/* Book cards */}
          {!loading && !error && (
            <>
              <div className="book-grid">
                {filteredBooks.map((book, index) => (
                  <article className="book-card" key={book.id}>
                    <div
                      className="book-cover"
                      style={{ background: book.color }}
                    >
                      <span className="cover-index">
                        BOOKHAVEN / {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="cover-art">
                        {book.emoji || "📚"}
                      </span>

                      <div className="cover-title">{book.title}</div>

                      <span className="cover-author">{book.author}</span>

                      <span className="cover-spine" />

                      <button
                        className="quick-add"
                        type="button"
                        aria-label={`Add ${book.title} to cart`}
                        disabled={addingBookId === book.id}
                        onClick={() => addToCart(book.id)}
                      >
                        {addingBookId === book.id ? "…" : "+"}
                      </button>
                    </div>

                    <div className="book-meta">
                      <span>{book.category || "Discover"}</span>

                      <span>
                        ₹{Number(book.price).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <h3>{book.title}</h3>
                    <p className="book-author">{book.author}</p>
                  </article>
                ))}
              </div>

              {/* No matching books */}
              {filteredBooks.length === 0 && (
                <div className="empty-state">
                  No books found. Try another search or category.
                </div>
              )}

              <div className="connection-status">
                Showing {filteredBooks.length} of {books.length} books on the
                current API page.
              </div>
            </>
          )}
        </section>

        {/* About section */}
        <section className="quote-section" id="about">
          <span className="quote-mark">“</span>

          <blockquote>
            A book is a little bit of someone else's world, waiting to become
            a part of yours.
          </blockquote>

          <span className="quote-caption">
            A NOTE FROM BOOKHAVEN · MADE FOR THE LOVE OF READING
          </span>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-icon">b.</span>

          <span>
            book<span className="brand-accent">haven</span>
            <small>YOUR NEXT CHAPTER STARTS HERE</small>
          </span>
        </a>

        <p>
          For the love of a good story. © {new Date().getFullYear()} Bookhaven.
        </p>

        <a href="#home">Back to top ↑</a>
      </footer>
    </div>
  );
}

export default App;