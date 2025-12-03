import logo from '../assets/logo/logo.png';
import './header.css';

const Header = () => {
  return (
    <>
      <nav className="navbar navbar-dark navbar-expand-lg px-4 py-3">
        <a className="navbar-brand fw-bold" href="#"><img src={logo} /></a>
        <div className="collapse navbar-collapse justify-content-end">
          <ul className="navbar-nav">
            <li className="nav-item mx-2">
              <a className="nav-link text-light" href="#">HOME</a>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link text-light" href="#">FEATURES</a>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link text-light" href="#">PORTFOLIO</a>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link text-light" href="#">RESUME</a>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link text-light" href="#">CLIENT</a>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link text-light" href="#">PRICING</a>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link text-light" href="#">BLOG</a>
            </li>
            <li className="nav-item mx-2">
              <button type="button" className="btn btn-outline-dark"><span className="buy-now">BUY NOW</span></button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Header;