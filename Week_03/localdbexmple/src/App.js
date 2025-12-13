import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar/navbar";
import DataFetch from "./components/Products/datafetchproduct";
import DataFetchParts from "./components/Parts/datafetchpart";

function App() {
  return (
    <BrowserRouter>
      
      <Navbar />

      {/* Add top spacing because navbar is fixed */}
      <div className="app-content">
        <Routes>
          <Route path="/" element={<DataFetch />} />
          <Route path="/parts" element={<DataFetchParts />} />
        </Routes>
      </div>

    </BrowserRouter>
  );
}

export default App;
