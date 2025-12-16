import React from "react";
import "./Invoice.css";

const Invoice = React.forwardRef(({ order }, ref) => {
  if (!order) return null;

  const {
    orderId,
    date,
    customer,
    items,
    totals,
    paymentMethod,
  } = order;

  return (
    <div className="invoice-wrapper" ref={ref}>
      <h1 className="invoice-logo">Jwellify Pvt. Ltd.</h1>
      <p className="invoice-sub">
        Rajkot, Gujarat – 36004 <br />
        +91 91733 16294 | support@jwellify.com
      </p>

      <hr />

      <div className="invoice-meta">
        <div>
          <b>Order ID:</b> {orderId}<br />
          <b>Date:</b> {date}<br />
          <b>Payment:</b> {paymentMethod}
        </div>
        <div>
          <b>Customer</b><br />
          {customer.name}<br />
          {customer.phone}<br />
          {customer.address}, {customer.city} - {customer.pincode}
        </div>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>₹ {p.price}</td>
              <td>{p.quantity}</td>
              <td>₹ {(p.price * p.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-summary">
        <p>Subtotal: ₹ {totals.subtotal.toFixed(2)}</p>
        <p>Delivery: ₹ {totals.delivery.toFixed(2)}</p>
        <p>GST (5%): ₹ {totals.gst.toFixed(2)}</p>
        <h3>Grand Total: ₹ {totals.grandTotal.toFixed(2)}</h3>
      </div>

      <p className="invoice-footer">
        Thank you for shopping with <b>Jwellify</b>
      </p>
    </div>
  );
});

export default Invoice;
