import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import "./MyOrders.css";

const API_URL = "http://localhost:8080";

export default function MyOrders() {
  const { user, basicToken } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !basicToken) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadOrders() {
      try {
        const response = await fetch(`${API_URL}/api/orders`, {
          headers: {
            Authorization: `Basic ${basicToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Unable to load orders (HTTP ${response.status}).`);
        }

        const data = await response.json();

        if (!cancelled) {
          setOrders(Array.isArray(data) ? data : data.content ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load your orders.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [user, basicToken]);

  if (!user) {
    return (
      <main className="orders-page">
        <section className="orders-empty">
          <h1>Sign in to view your orders</h1>
          <p>Your purchases will appear here after you sign in.</p>
          <button onClick={() => navigate("/login")}>Sign In</button>
        </section>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <header className="orders-header">
        <span className="orders-eyebrow">YOUR BOOKHAVEN ACCOUNT</span>
        <h1>My Orders</h1>
        <p>Every good book becomes part of your story.</p>
      </header>

      {loading && <p className="orders-message">Loading your orders...</p>}

      {error && (
        <div className="orders-error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <section className="orders-empty">
          <div className="orders-empty-icon">▤</div>
          <h2>No orders yet</h2>
          <p>Your next favourite book is waiting to be discovered.</p>
          <button onClick={() => navigate("/")}>Explore Books</button>
        </section>
      )}

      {!loading && !error && orders.length > 0 && (
        <section className="orders-list">
          {orders.map((order) => {
            const orderId = order.id ?? order.orderId;
            const total = order.totalAmount ?? order.total ?? 0;
            const status = order.status ?? "PLACED";
            const items = order.items ?? order.orderItems ?? [];

            return (
              <article className="order-card" key={orderId}>
                <div className="order-card-top">
                  <div>
                    <span className="order-label">ORDER NUMBER</span>
                    <h2>#{orderId}</h2>
                  </div>

                  <span className="order-status">{status}</span>
                </div>

                <div className="order-items">
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <div
                        className="order-item"
                        key={item.id ?? item.orderItemId ?? index}
                      >
                        <div>
                          <strong>
                            {item.title ?? item.bookTitle ?? "Book"}
                          </strong>
                          <p>Quantity: {item.quantity ?? 1}</p>
                        </div>

                        <span>
                          ₹
                          {Number(
                            item.subtotal ??
                              (item.price ?? 0) * (item.quantity ?? 1)
                          ).toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="orders-message">
                      Item details are not available in this response.
                    </p>
                  )}
                </div>

                <div className="order-card-bottom">
                  <span>Total amount</span>
                  <strong>₹{Number(total).toFixed(2)}</strong>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <button
        className="orders-back-button"
        onClick={() => navigate("/")}
      >
        ← Continue shopping
      </button>
    </main>
  );
}
