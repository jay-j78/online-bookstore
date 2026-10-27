import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import "./Checkout.css";

const API_URL = "http://localhost:8080";

export default function Checkout() {
  const { user, basicToken } = useAuth();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setShipping((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!user || !basicToken) {
      navigate("/login");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(shipping.phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(shipping.pincode)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/orders/checkout`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || `Checkout failed (HTTP ${response.status}).`
        );
      }

      const order = await response.json();

      navigate("/order-confirmation", {
        state: {
          order,
          shipping,
        },
      });
    } catch (err) {
      setError(
        err.message ||
          "Unable to place your order. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <main className="checkout-page">
        <section className="checkout-card">
          <h1>Sign in to continue</h1>
          <p>Please sign in before placing your order.</p>
          <button onClick={() => navigate("/login")}>Sign In</button>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section className="checkout-container">
        <div className="checkout-heading">
          <span className="checkout-eyebrow">BOOKHAVEN CHECKOUT</span>
          <h1>Almost yours.</h1>
          <p>Enter your delivery details to place your order.</p>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <section className="checkout-card">
            <h2>Delivery information</h2>
            <p className="checkout-description">
              Where should we deliver your books?
            </p>

            <div className="checkout-fields">
              <label className="checkout-field checkout-full">
                Full name
                <input
                  name="fullName"
                  value={shipping.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  maxLength={100}
                />
              </label>

              <label className="checkout-field">
                Mobile number
                <input
                  name="phone"
                  type="tel"
                  value={shipping.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  pattern="[6-9][0-9]{9}"
                  required
                />
              </label>

              <label className="checkout-field">
                PIN code
                <input
                  name="pincode"
                  value={shipping.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  required
                />
              </label>

              <label className="checkout-field checkout-full">
                Street address
                <textarea
                  name="address"
                  value={shipping.address}
                  onChange={handleChange}
                  placeholder="House number, street, area"
                  required
                  maxLength={300}
                  rows={3}
                />
              </label>

              <label className="checkout-field">
                City
                <input
                  name="city"
                  value={shipping.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                  maxLength={100}
                />
              </label>

              <label className="checkout-field">
                State
                <input
                  name="state"
                  value={shipping.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                  maxLength={100}
                />
              </label>
            </div>
          </section>

          <section className="checkout-card checkout-note">
            <h2>Payment method</h2>
            <p>
              <strong>Cash on Delivery</strong>
            </p>
            <p className="checkout-description">
              This is a demonstration checkout. No online payment is collected.
            </p>
          </section>

          {error && (
            <div className="checkout-error" role="alert">
              {error}
            </div>
          )}

          <div className="checkout-actions">
            <button
              type="button"
              className="checkout-back"
              onClick={() => navigate("/cart")}
              disabled={loading}
            >
              Back to cart
            </button>

            <button
              type="submit"
              className="checkout-submit"
              disabled={loading}
            >
              {loading ? "Placing order..." : "Place order →"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
