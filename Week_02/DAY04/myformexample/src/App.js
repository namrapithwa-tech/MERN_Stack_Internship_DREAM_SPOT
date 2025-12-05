import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import FormExample from './components/FormExample/formexample';
import SubmitFormexample from './components/SubmitFormExample/submitformexample';
import Navimage from './assets/React.png';
import Home from './components/Home/home';

function App() {
  return (
    <>

      <BrowserRouter>
        {/* Navigation */}
        <nav className="navbar">
          <div className="container navbar-content">
            <div className="logo">
              <a href="#">
                <img src={Navimage} alt="Ract Logo" />
              </a>
            </div>

            <div className="nav-menu">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/onChange" className="nav-link">onChange</Link>
              <Link to="/onSubmit" className="nav-link">onSubmit</Link>
              {/* <button className="btn-buy-now">Buy Now</button> */}
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/onChange" element={<FormExample />} />
          <Route path="/onSubmit" element={<SubmitFormexample />} />
          <Route path="/form" element={<FormExample />} />
        </Routes>

      </BrowserRouter>
    </>
  );
}

export default App;
