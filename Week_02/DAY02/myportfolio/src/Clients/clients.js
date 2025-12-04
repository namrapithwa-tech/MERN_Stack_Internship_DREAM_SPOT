import "./clients.css";
import client1 from "../assets/media/client_section/client1.png";
import client2 from '../assets/media/client_section/client2.png';
import client3 from '../assets/media/client_section/client3.png';
import client4 from '../assets/media/client_section/client4.png';
import client5 from '../assets/media/client_section/client5.png';

const Clients = () => {
  return (
    <>
      <div className="container py-5">
        <div className="row mb-5">
          <div className="col-12 text-center text-md-start">
            <h6 className="subtitle">POPULAR CLIENTS</h6>
            <br/>
            <h2 className="title">Awesome Clients</h2>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-3 col-md-4 mb-4">
            <div className="sidebar-wrapper sticky-sidebar">
              <div
                className="nav flex-column nav-pills"
                id="v-pills-tab"
                role="tablist"
                aria-orientation="vertical"
              >
                <button
                  className="nav-link active"
                  id="v-pills-js-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#v-pills-js"
                  type="button"
                  role="tab"
                >
                  Javascript
                </button>
                <button
                  className="nav-link"
                  id="v-pills-design-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#v-pills-design"
                  type="button"
                  role="tab"
                >
                  Product Design
                </button>
                <button
                  className="nav-link"
                  id="v-pills-wp-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#v-pills-wp"
                  type="button"
                  role="tab"
                >
                  Wordpress
                </button>
                <button
                  className="nav-link"
                  id="v-pills-html-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#v-pills-html"
                  type="button"
                  role="tab"
                >
                  HTML to React
                </button>
                <button
                  className="nav-link"
                  id="v-pills-react-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#v-pills-react"
                  type="button"
                  role="tab"
                >
                  React To Laravel
                </button>
                <button
                  className="nav-link"
                  id="v-pills-python-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#v-pills-python"
                  type="button"
                  role="tab"
                >
                  Python
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-9 col-md-8">
            <div className="tab-content" id="v-pills-tabContent">
              <div
                className="tab-pane fade show active"
                id="v-pills-js"
                role="tabpanel"
              >
                <div className="row g-4">
                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img src={client1} alt="Client Logo" />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Marth Smith</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img src={client2} alt="Client Logo" />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">John Doe</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client3}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Adon Smith</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client4}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Sultana Mila</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client5}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Jannat</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client1}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Mila Dus</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client2}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Tech So</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client3}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Alpha Node</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client4}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Beta Stack</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client5}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Gamma Ray</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client1}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Delta Core</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client2}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Omega</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tab-pane fade" id="v-pills-design" role="tabpanel">
                <div className="row g-4">
                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img src={client1} alt="Client Logo" />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Marth Smith</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img src={client2} alt="Client Logo" />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">John Doe</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client3}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Adon Smith</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client4}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Sultana Mila</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client5}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Jannat</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client1}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Mila Dus</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client2}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Tech So</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client3}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Alpha Node</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client4}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Beta Stack</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client5}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Gamma Ray</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client1}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Delta Core</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client2}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Omega</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tab-pane fade" id="v-pills-wp" role="tabpanel">
                <div className="row g-4">
                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img src={client1} alt="Client Logo" />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Marth Smith</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img src={client2} alt="Client Logo" />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">John Doe</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client3}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Adon Smith</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client4}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Sultana Mila</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client5}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Jannat</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client1}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Mila Dus</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client2}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Tech So</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client3}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Alpha Node</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client4}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Beta Stack</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client5}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Gamma Ray</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client1}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Delta Core</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client2}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Omega</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tab-pane fade" id="v-pills-html" role="tabpanel">
                <div className="row g-4">
                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img src={client1} alt="Client Logo" />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Marth Smith</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img src={client2} alt="Client Logo" />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">John Doe</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client3}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Adon Smith</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client4}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Sultana Mila</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client5}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Jannat</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client1}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Mila Dus</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client2}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Tech So</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client3}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Alpha Node</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client4}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Beta Stack</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client5}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Gamma Ray</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client1}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Delta Core</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client2}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Omega</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tab-pane fade" id="v-pills-react" role="tabpanel">
                <div className="row g-4">
                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img src={client1} alt="Client Logo" />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Marth Smith</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img src={client2} alt="Client Logo" />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">John Doe</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client3}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Adon Smith</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client4}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Sultana Mila</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client5}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Jannat</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client1}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Mila Dus</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client2}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Tech So</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client3}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Alpha Node</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client4}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Beta Stack</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client5}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Gamma Ray</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client1}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Delta Core</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client2}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Omega</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tab-pane fade" id="v-pills-python" role="tabpanel">
               <div className="row g-4">
                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img src={client1} alt="Client Logo" />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Marth Smith</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img src={client2} alt="Client Logo" />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">John Doe</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client3}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Adon Smith</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client4}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Sultana Mila</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client5}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Jannat</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client1}
                          alt="Client Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Mila Dus</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client2}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Tech So</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client3}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Alpha Node</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client4}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Beta Stack</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client5}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Gamma Ray</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client1}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Delta Core</h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="client-card">
                      <div className="img-wrapper">
                        <img
                          src={client2}
                          alt="Logo"
                        />
                      </div>
                      <hr className="card-divider" />
                      <div className="text-wrapper">
                        <h5 className="client-name">Omega</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr className="hr-1"></hr>
    </>
  );
};

export default Clients;