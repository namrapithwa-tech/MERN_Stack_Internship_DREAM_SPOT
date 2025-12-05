import './price.css'

const Price = () => {
    return(
        <>
            <div className="main-wrapper">
                <div className="container">
                    <div className="row align-items-start">
                        
                        {/* <!-- LEFT SIDE: Title Section --> */}
                        <div className="col-lg-4 col-md-12 mb-5 mb-lg-0">
                            <div className="pricing-header text-center text-lg-center">
                                <h6 className="text-uppercase text-danger fw-bold ls-2 mb-2">PRICING</h6>
                                <h1 className="display-3 fw-bold text-white">My Pricing</h1>
                            </div>
                        </div>

                        {/* <!-- RIGHT SIDE: Pricing Card --> */}
                        <div className="col-lg-8 col-md-12 d-flex justify-content-center justify-content-lg-start">
                            <div className="pricing-card shadow-lg">
                                
                                {/* <!-- Tabs Navigation Wrapper --> */}
                                <div className="tabs-container">
                                    <ul className="nav nav-pills nav-fill" id="pricing-tab" role="tablist">
                                        <li className="nav-item" role="presentation">
                                            <button className="nav-link" id="static-tab" data-bs-toggle="pill" data-bs-target="#static" type="button" role="tab">Static</button>
                                        </li>
                                        <li className="nav-item position-relative" role="presentation">
                                            {/* <!-- Recommended Badge --> */}
                                            <div className="badge-recommended">Recommended</div>
                                            <button className="nav-link active" id="standard-tab" data-bs-toggle="pill" data-bs-target="#standard" type="button" role="tab">Standard</button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button className="nav-link" id="premium-tab" data-bs-toggle="pill" data-bs-target="#premium" type="button" role="tab">Premium</button>
                                        </li>
                                    </ul>
                                </div>

                                {/* <!-- Card Body Content --> */}
                                <div className="card-body-content">
                                    <div className="tab-content" id="pricing-tabContent">
                                        
                                        {/* <!-- STATIC TAB --> */}
                                        <div className="tab-pane fade" id="static" role="tabpanel">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <h3 className="card-title mb-0">Make Your Single Page</h3>
                                                <div className="price-tag">$30.00</div>
                                            </div>
                                            <p className="text-secondary mb-4 small-subtitle">Elementor</p>
                                            
                                            <p className="description-text mb-4">
                                                All the lorem ipsum generators on the internet tend to repeat predefined chunks as necessary.
                                            </p>
                                            
                                            <div className="row feature-list mb-4">
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> 1 Page with Elementor</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> multipage Elementor</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Design Customization</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Design Figma</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Responsive Design</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Maintain Design</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Content Upload</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Design With XD</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> 2 Plugins/Extensions</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> 8 Plugins/Extensions</div>
                                            </div>
                                        </div>

                                        {/* <!-- STANDARD TAB --> */}
                                        <div className="tab-pane fade show active" id="standard" role="tabpanel">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <h3 className="card-title mb-0">Design Make this Page</h3>
                                                <div className="price-tag">$50.00</div>
                                            </div>
                                            <p className="text-secondary mb-4 small-subtitle">Elementor</p>
                                            
                                            <p className="description-text mb-4">
                                                Making this the first true generator on the internet. It uses a dictionary & plugin Development.
                                            </p>
                                            
                                            <div className="row feature-list mb-4">
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> 1 Page with Elementor</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> multipage Elementor</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Design Customization</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Design Figma</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Responsive Design</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Maintain Design</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Content Upload</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Design With XD</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> 2 Plugins/Extensions</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> 8 Plugins/Extensions</div>
                                            </div>
                                        </div>

                                        {/* <!-- PREMIUM TAB --> */}
                                        <div className="tab-pane fade" id="premium" role="tabpanel">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <h3 className="card-title mb-0">Customize Your Single Page</h3>
                                                <div className="price-tag">$90.00</div>
                                            </div>
                                            <p className="text-secondary mb-4 small-subtitle">Elementor</p>
                                            
                                            <p className="description-text mb-4">
                                                I will install your desire theme and made like Theme demo and customize your single page( homepage)
                                            </p>
                                            
                                            <div className="row feature-list mb-4">
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> 1 Page with Elementor</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> multipage Elementor</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Design Customization</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Design Figma</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Responsive Design</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> MAintaine Design</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Content Upload</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Content Upload</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Design Customization</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> Design With XD</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> 2 Plugins/Extensions</div>
                                                <div className="col-6 mb-3"><i className="fas fa-check me-2"></i> 8 Plugins/Extensions</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* <!-- Order Button Area --> */}
                                    <div className="order-area mt-auto">
                                        <a href="#" className="order-btn-block">
                                            ORDER NOW <i className="fas fa-arrow-right ms-2"></i>
                                        </a>
                                        <div className="delivery-info text-center mt-3">
                                            <span className="me-3"><i className="far fa-clock me-1"></i> 2 Days Delivery</span>
                                            <span><i className="fas fa-infinity me-1"></i> Unlimited Revission</span>
                                        </div>
                                    </div>
                                </div> 
                                {/* <!-- End Card Body -->  */}
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="hr-1"></hr>
            </div>
        </>
    );
};

export default Price;