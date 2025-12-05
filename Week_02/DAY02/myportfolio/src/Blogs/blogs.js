import './blogs.css';
import blog1 from '../assets/media/blogs_section/blog1.jpg'
import blog2 from '../assets/media/blogs_section/blog2.jpg'
import blog3 from '../assets/media/blogs_section/blog3.jpg'

const Blogs = () => {
  return (
    <>
      <section className="blog-area" id="blog">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="section-heading text-center">
                <h4>VISIT MY BLOG AND KEEP YOUR FEEDBACK</h4>
                <h1>My Blog</h1>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="blog-box">
                <div className="blog-image">
                  <img src={blog1} alt="Development" />
                </div>
                <div className="blog-content">
                  <div className="category-list">
                    <span className="category">CANADA</span>
                    <span className="likes">
                      <i className="fa-regular fa-clock"></i> 2 min read
                    </span>
                  </div>
                  <h3 className="title">
                    <a href="#">T-shirt design is part of design</a>
                  </h3>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="blog-box">
                <div className="blog-image">
                  <img src={blog2} alt="Application" />
                </div>
                <div className="blog-content">
                  <div className="category-list">
                    <span className="category">DEVELOPMNT</span>
                    <span className="likes">
                      <i className="fa-regular fa-clock"></i> 2 hour read
                    </span>
                  </div>
                  <h3 className="title">
                    <a href="#">The service provide for design</a>
                  </h3>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="blog-box">
                <div className="blog-image">
                  <img src={blog3} alt="Photoshop" />
                </div>
                <div className="blog-content">
                  <div className="category-list">
                    <span className="category">APPLICATION</span>
                    <span className="likes">
                      <i className="fa-regular fa-clock"></i> 5 min read
                    </span>
                  </div>
                  <h3 className="title">
                    <a href="#">Mobile app landing design & app maintain</a>
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr className="hr-1"></hr>
      </section>
    </>
  );
};

export default Blogs;