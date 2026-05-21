"use client";

import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
} from "@stripe/react-stripe-js";

export const stripeElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#0f172a",
      "::placeholder": { color: "#94a3b8" },
    },
    invalid: { color: "#b91c1c" },
  },
};

export const stripeFieldStyle = {
  padding: "0.75rem 0.8rem",
  border: "1px solid #ccc",
  borderRadius: "8px",
  background: "#fff",
};

export const stripeLabelStyle = {
  display: "block",
  marginBottom: "0.35rem",
  fontSize: "0.92rem",
  fontWeight: 500,
  color: "#222",
};

export function StripeCardFields({ testHint = true }) {
  return (
    <>
      <label style={stripeLabelStyle} htmlFor="card-number">
        Numéro de carte
      </label>
      <div id="card-number" style={{ ...stripeFieldStyle, marginBottom: "1rem" }}>
        <CardNumberElement options={stripeElementOptions} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: testHint ? "1rem" : 0,
        }}
      >
        <div>
          <label style={stripeLabelStyle} htmlFor="card-expiry">
            Date d&apos;expiration
          </label>
          <div id="card-expiry" style={stripeFieldStyle}>
            <CardExpiryElement options={stripeElementOptions} />
          </div>
        </div>
        <div>
          <label style={stripeLabelStyle} htmlFor="card-cvc">
            Cryptogramme (CVC)
          </label>
          <div id="card-cvc" style={stripeFieldStyle}>
            <CardCvcElement options={stripeElementOptions} />
          </div>
        </div>
      </div>

      {testHint ? (
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
          En test : <code>4242 4242 4242 4242</code>, date future, CVC{" "}
          <code>123</code>.
        </p>
      ) : null}
    </>
  );
}
