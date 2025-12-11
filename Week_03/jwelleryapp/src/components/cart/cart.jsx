import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import "./cart.css";

const EmptyCartAnimation = () => {
  // Inline SVG + small sparkles for premium glass 3D cart drawing
  return (
    <div className="empty-anim-wrap">
      <svg className="empty-cart-svg" viewBox="0 0 200 140" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <defs>
          <linearGradient id="gGold" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#ffd47a" />
            <stop offset="100%" stopColor="#c8a049" />
          </linearGradient>
        </defs>

        {/* cart path (line-draw animation) */}
        <g stroke="url(#gGold)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path className="cart-path" d="M12 30 L40 30 L60 90 L150 90 L170 40 L70 40" />
          <circle className="wheel" cx="70" cy="100" r="8" />
          <circle className="wheel" cx="140" cy="100" r="8" />
        </g>

        {/* shimmer highlight */}
        <g className="cart-shine" opacity="0.0">
          <path d="M15 35 L40 35" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>

      {/* small golden sparkles */}
      <div className="empty-sparkles">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="sparkle" style={{ left: `${10 + i * 10}%`, animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
    </div>
  );
};

const Cart = () => {
  const { cart, removeFromCart, updateQty, totals } = useContext(CartContext);
  const navigate = useNavigate();
  const { subtotal, delivery, gst, grandTotal } = totals();

  return (
    <div className="cart-page container my-5">
      <h2 className="section-title mb-4">Your Cart</h2>

      {cart.length === 0 ? (
        <div className="glass p-4 empty-cart-box">
          {/* Animation on top (Option B layout: animation above, text/button below) */}
          <EmptyCartAnimation />

          <div className="empty-text mt-4 text-center">
            <h4>Your cart is empty</h4>
            <p className="text-muted">Looks like you haven't added any items yet.</p>
            <div className="d-flex justify-content-center mt-3">
              <button className="auth-btn" onClick={() => navigate("/products")}>Browse Products</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          {/* LEFT - items */}
          <div className="col-md-8">
            <div className="glass p-3">
              {cart.map((item) => (
                <div key={item.id} className="cart-item d-flex gap-3 align-items-center mb-3">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="flex-grow-1">
                    <h5 className="mb-1">{item.name}</h5>
                    <div className="text-muted">₹ {item.price.toFixed(2)}</div>
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity - 1)}>-</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>

                      <button className="delete-btn ms-3" onClick={() => removeFromCart(item.id)}><i className="bi bi-trash"></i></button>
                    </div>
                  </div>

                  <div className="fw-bold">₹ {(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT - summary */}
          <div className="col-md-4">
            <div className="glass p-4 summary-box">
              <h5>Order Summary</h5>
              <div className="d-flex justify-content-between mt-3">
                <div>Subtotal</div>
                <div>₹ {subtotal.toFixed(2)}</div>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <div>Delivery</div>
                <div>₹ {delivery.toFixed(2)}</div>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <div>GST (5%)</div>
                <div>₹ {gst.toFixed(2)}</div>
              </div>

              <hr />

              <div className="d-flex justify-content-between fw-bold mb-3">
                <div>Total</div>
                <div>₹ {grandTotal.toFixed(2)}</div>
              </div>

              <button className="auth-btn w-100" onClick={() => navigate("/checkout")}>Go to Check Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
