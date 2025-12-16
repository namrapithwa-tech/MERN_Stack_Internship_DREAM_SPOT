import React, { createContext, useState } from "react";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [order, setOrder] = useState(null);

  const placeOrder = (orderData) => {
    setOrder(orderData);
  };

  const clearOrder = () => {
    setOrder(null);
  };

  return (
    <OrderContext.Provider value={{ order, placeOrder, clearOrder }}>
      {children}
    </OrderContext.Provider>
  );
};
