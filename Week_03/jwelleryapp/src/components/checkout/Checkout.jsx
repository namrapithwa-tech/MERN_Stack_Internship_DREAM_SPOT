import React, { useContext, useEffect, useRef, useState } from "react";
import { CartContext } from "../../context/CartContext";
import { OrderContext } from "../../context/OrderContext";
import Invoice from "../invoice/Invoice";
import { generateInvoicePDF } from "../invoice/invoicePdf";
import "./Checkout.css";

const Checkout = () => {
  const { cart, totals, clearCart } = useContext(CartContext);
  const { placeOrder, order } = useContext(OrderContext);

  const { subtotal, delivery, gst, grandTotal } = totals();

  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const invoiceRef = useRef();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    payment: "Cash",
  });

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode) {
      alert("Please fill all delivery details.");
      return;
    }

    const generatedOrderId =
      "OD" + Math.random().toString(36).substring(2, 8).toUpperCase() + "JWELLIFY";

    const orderData = {
      orderId: generatedOrderId,
      date: new Date().toLocaleDateString(),
      paymentMethod: form.payment,
      customer: { ...form },
      items: cart,
      totals: { subtotal, delivery, gst, grandTotal },
    };

    placeOrder(orderData);
    setOrderId(generatedOrderId);
    clearCart();
    setPlaced(true);
  };

  // AUTO PDF DOWNLOAD AFTER SUCCESS
  useEffect(() => {
    if (placed && invoiceRef.current) {
      setTimeout(() => {
        generateInvoicePDF(invoiceRef.current, orderId);
      }, 900);
    }
  }, [placed, orderId]);

  return (
    <>
      {!placed ? (
        <div className="checkout-page container my-5">
          <h2 className="section-title mb-4">Checkout</h2>

          <div className="row">
            {/* LEFT FORM */}
            <div className="col-md-7">
              <div className="glass p-4">
                <h5>Delivery Address</h5>

                <form onSubmit={handlePlaceOrder}>
                  <input className="input-box" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
                  <input className="input-box" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
                  <input className="input-box" name="address" placeholder="Address" value={form.address} onChange={handleChange} />
                  <input className="input-box" name="city" placeholder="City" value={form.city} onChange={handleChange} />
                  <input className="input-box" name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} />

                  <h6 className="mt-3">Payment Method</h6>
                  <select className="input-box" name="payment" value={form.payment} onChange={handleChange}>
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Debit Card</option>
                    <option>Credit Card</option>
                  </select>

                  <button className="auth-btn mt-3 w-100">Place Order</button>
                </form>
              </div>
            </div>

            {/* RIGHT SUMMARY */}
            <div className="col-md-5">
              <div className="glass p-4">
                <h5>Order Summary</h5>

                <div className="d-flex justify-content-between mt-3">
                  <span>Subtotal</span><span>₹ {subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <span>Delivery</span><span>₹ {delivery.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <span>GST (5%)</span><span>₹ {gst.toFixed(2)}</span>
                </div>

                <hr />

                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span><span>₹ {grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="checkout-success">
          <div className="overlay"></div>
          <CanvasCelebration />

          <div className="success-box glass">
            <h1>🎉 Your order is placed!</h1>
            <p>Order ID: <b>{orderId}</b></p>
            <p>Thank you for shopping with <b>Jwellify</b></p>
          </div>
        </div>
      )}

      {/* HIDDEN INVOICE FOR PDF */}
      {order && (
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <Invoice ref={invoiceRef} order={order} />
        </div>
      )}
    </>
  );
};

export default Checkout;

/* ---- CanvasCelebration remains EXACTLY same as your current code ---- */



/* ---------------------------------------------------
   FULL-SCREEN CANVAS CELEBRATION (FIXED & OPTIMIZED)
--------------------------------------------------- */
function CanvasCelebration() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    const rand = (min, max) => Math.random() * (max - min) + min;

    const particles = [];
    const rockets = [];
    const colors = ["#c8a049", "#ffd47a", "#ffd6b3", "#f7c6d3", "#c3e7ff", "#ffffff"];

    /** Convert any color safely to RGBA **/
    const toRGBA = (clr, alpha) => {
      let c = document.createElement("canvas");
      let x = c.getContext("2d");
      x.fillStyle = clr;
      let computed = x.fillStyle;
      const m = computed.match(/rgb\((\d+), (\d+), (\d+)\)/);
      if (!m) return `rgba(255,255,255,${alpha})`;
      return `rgba(${m[1]},${m[2]},${m[3]},${alpha})`;
    };

    /** Particle after explosion **/
    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;

        const angle = rand(0, Math.PI * 2);
        const speed = rand(1.5, 7.5);

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.size = rand(1.2, 3.6);
        this.life = rand(50, 120);

        this.alpha = 1;
        this.decay = rand(0.01, 0.03);

        this.color = color;
      }

      update() {
        this.vy += 0.06;
        this.vx *= 0.99;
        this.vy *= 0.99;
        this.x += this.vx;
        this.y += this.vy;

        this.life--;
        this.alpha -= this.decay;

        return this.life > 0 && this.alpha > 0;
      }

      draw() {
        ctx.globalAlpha = this.alpha;

        const glow0 = toRGBA(this.color, 1);
        const glow1 = toRGBA(this.color, 0.45);
        const glow2 = toRGBA(this.color, 0);

        const g = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 8
        );

        g.addColorStop(0, glow0);
        g.addColorStop(0.3, glow1);
        g.addColorStop(1, glow2);

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = toRGBA(this.color, 1);
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);

        ctx.globalAlpha = 1;
      }
    }

    /** Rockets that fly up then explode **/
    class Rocket {
      constructor() {
        this.x = rand(w * 0.2, w * 0.8);
        this.y = h + 40;
        this.vx = rand(-1.5, 1.5);
        this.vy = rand(-14, -10);
        this.alpha = 1;
        this.color = colors[Math.floor(rand(0, colors.length))];
      }

      update() {
        this.vy += 0.35;
        this.x += this.vx;
        this.y += this.vy;

        if (this.vy > -2) {
          explode(this.x, this.y, this.color);
          return false;
        }
        return this.y > -50;
      }

      draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const explode = (x, y, color) => {
      const count = Math.floor(rand(40, 90));
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
      }
    };

    setInterval(() => rockets.push(new Rocket()), 700);

    const loop = () => {
      ctx.clearRect(0, 0, w, h);

      rockets.forEach((r, i) => {
        if (!r.update()) rockets.splice(i, 1);
        else r.draw();
      });

      particles.forEach((p, i) => {
        if (!p.update()) particles.splice(i, 1);
        else p.draw();
      });

      requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="celebration-canvas" />;
}
