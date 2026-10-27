import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./Cart.css";

const API = "http://localhost:8080/api/cart";

export default function Cart() {
  const { user, basicToken } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const request = useCallback(
    async (url, options = {}) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Basic ${basicToken}`,
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers,
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          response.status === 401
            ? "Your session is invalid. Please log in again."
            : "Your account does not have permission to access this cart."
        );
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`);
      }

      if (response.status === 204) return null;

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    },
    [basicToken]
  );

  const loadCart = useCallback(async () => {
    if (!user || !basicToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await request(API);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  }, [user, basicToken, request]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  async function updateQuantity(item, quantity) {
    if (quantity < 1) return;

    setBusyId(item.cartItemId);
    setError("");

    try {
      await request(`${API}/items/${item.cartItemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      });

      await loadCart();
    } catch (err) {
      setError(err.message || "Unable to update quantity.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeItem(item) {
    setBusyId(item.cartItemId);
    setError("");

    try {
      await request(`${API}/items/${item.cartItemId}`, {
        method: "DELETE",
      });

      await loadCart();
    } catch (err) {
      setError(err.message || "Unable to remove this book.");
    } finally {
      setBusyId(null);
    }
  }

  const total = items.reduce(
    (sum, item) => sum + Number(item.subtotal || 0),
    0
  );

  function formatPrice(price) {
    return `₹${Number(price).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  if (!user || !basicToken) {
    return (
      <main className="cart-page">
        <Link className="cart-brand" to="/">b. bookhaven</Link>
        <section className="cart-message">
          <h1>Your reading journey starts here.</h1>
          <p>Please log in to view your personal shopping cart.</p>
          <button onClick={() => navigate("/login", {
            state: { from: "/cart" },
          })}>
            Log in to continue
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <header className="cart-header">
        <Link className="cart-brand" to="/">b. bookhaven</Link>
        <Link to="/">Continue shopping ←</Link>
      </header>

      <section className="cart-content">
        <div className="cart-heading">
          <p className="cart-eyebrow">YOUR BOOKHAVEN BAG</p>
          <h1>Your <em>reading list.</em></h1>
          <p>{items.length} {items.length === 1 ? "item" : "items"} in your cart</p>
        </div>

        {error && (
          <div className="cart-error" role="alert">
            {error}
            {error.includes("log in") && (
              <button onClick={() => navigate("/login")}>Log in again</button>
            )}
          </div>
        )}

        {loading ? (
          <p className="cart-message">Loading your cart...</p>
        ) : items.length === 0 ? (
          <section className="cart-message">
            <div className="cart-empty-icon">♡</div>
            <h2>Your bag is waiting for a story.</h2>
            <p>You haven't added any books yet.</p>
            <Link className="cart-primary" to="/#catalog">
              Explore the collection
            </Link>
          </section>
        ) : (
          <>
            <div className="cart-layout">
              <div className="cart-items">
                {items.map((item) => (
                  <article className="cart-item" key={item.cartItemId}>
                    <div className="cart-book-art">📚</div>

                    <div className="cart-item-details">
                      <p className="cart-item-author">{item.author}</p>
                      <h2>{item.title}</h2>
                      <p className="cart-item-price">
                        {formatPrice(item.price)} each
                      </p>

                      <div className="cart-item-actions">
                        <div className="quantity-control">
                          <button
                            aria-label={`Decrease quantity of ${item.title}`}
                            disabled={busyId === item.cartItemId || item.quantity <= 1}
                            onClick={() => updateQuantity(item, item.quantity - 1)}
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            aria-label={`Increase quantity of ${item.title}`}
                            disabled={busyId === item.cartItemId}
                            onClick={() => updateQuantity(item, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>

                        <button
                          className="cart-remove"
                          disabled={busyId === item.cartItemId}
                          onClick={() => removeItem(item)}
                        >
                          {busyId === item.cartItemId
                            ? "Updating..."
                            : "Remove"}
                        </button>
                      </div>
                    </div>

                    <strong className="cart-subtotal">
                      {formatPrice(item.subtotal)}
                    </strong>
                  </article>
                ))}
              </div>

              <aside className="cart-summary">
                <p className="cart-eyebrow">YOUR ORDER</p>
                <h2>Order summary</h2>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <span>Not included</span>
                </div>

                <div className="summary-total">
                  <span>Total</span>
                  <strong>{formatPrice(total)}</strong>
                </div>

                <button
                  className="cart-primary"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to checkout →
                </button>

                <p className="cart-summary-note">
                  Your order total is calculated from the items in your cart.
                </p>
              </aside>
            </div>
          </>
        )}
      </section>
    </main>
  );
}