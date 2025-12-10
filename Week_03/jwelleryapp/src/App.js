import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductDetails from './components/Product_Details/ProductDetails';
import ProductList from './components/shop_sorting/ProductList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
