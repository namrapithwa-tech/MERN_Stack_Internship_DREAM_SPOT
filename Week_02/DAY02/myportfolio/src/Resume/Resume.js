import './Resume.css';

import { useState } from "react";

const Resume = () => {
    const [activeTab, setActiveTab] = useState('education');
  return (
    <>
      <div className="resume-container">
        <section className="resume-section" id="resume">
          <div className="container">
            {/* Header */}
            <div className="row">
              <div className="col-12 text-center section-heading">
                <h4>7+ YEARS OF EXPERIENCE</h4>
                <h1>My Resume</h1>
              </div>
            </div>

            {/* Tabs Menu */}
            <div className="row mt-4">
              <div className="col-12">
                <ul className="resume-tab-nav">
                  <li className="nav-item">
                    <button
                      className={activeTab === "education" ? "active" : ""}
                      onClick={() => setActiveTab("education")}
                    >
                      Education
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={activeTab === "skills" ? "active" : ""}
                      onClick={() => setActiveTab("skills")}
                    >
                      Professional Skills
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={activeTab === "experience" ? "active" : ""}
                      onClick={() => setActiveTab("experience")}
                    >
                      Experience
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={activeTab === "interview" ? "active" : ""}
                      onClick={() => setActiveTab("interview")}
                    >
                      Interview
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tab Content Area */}
            <div className="tab-content">
              {/* ================= TAB 1: EDUCATION ================= */}
              {activeTab === "education" && (
                <div className="row fade-in">
                  {/* Left Column */}
                  <div className="col-lg-6 col-md-12">
                    <div className="timeline-heading">
                      <span>2007 - 2010</span>
                      <h3>Education Quality</h3>
                    </div>
                    <div className="timeline-wrapper">
                      <div className="resume-card">
                        <div className="card-header-resume">
                          <div className="text-content">
                            <h4>Personal Portfolio April Fools</h4>
                            <span>University of DVI (1997 - 2001)</span>
                          </div>
                          <div className="rating-badge">4.30/5</div>
                        </div>
                        <p>
                          The education should be very interactual. Ut tincidunt
                          est ac dolor aliquam sodales. Phasellus sed mauris
                          hendrerit, laoreet sem in, lobortis mauris hendrerit
                          ante.
                        </p>
                      </div>
                      <div className="resume-card">
                        <div className="card-header-resume">
                          <div className="text-content">
                            <h4>Examples Of Personal Portfolio</h4>
                            <span>College of Studies (2000 - 2002)</span>
                          </div>
                          <div className="rating-badge">4.50/5</div>
                        </div>
                        <p>
                          Maecenas finibus nec sem ut imperdiet. Ut tincidunt
                          est ac dolor aliquam sodales. Phasellus sed mauris
                          hendrerit, laoreet sem in, lobortis mauris hendrerit
                          ante.
                        </p>
                      </div>
                      <div className="resume-card">
                        <div className="card-header-resume">
                          <div className="text-content">
                            <h4>Tips For Personal Portfolio</h4>
                            <span>University of Studies (1997 - 2001)</span>
                          </div>
                          <div className="rating-badge">4.80/5</div>
                        </div>
                        <p>
                          If you are going to use a passage. Ut tincidunt est ac
                          dolor aliquam sodales. Phasellus sed mauris hendrerit,
                          laoreet sem in, lobortis mauris hendrerit ante.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="col-lg-6 col-md-12">
                    <div className="timeline-heading">
                      <span>2007 - 2010</span>
                      <h3>Job Experience</h3>
                    </div>
                    <div className="timeline-wrapper">
                      <div className="resume-card">
                        <div className="card-header-resume">
                          <div className="text-content">
                            <h4>Diploma in Web Development</h4>
                            <span>BSE In CSE (2004 - 2008)</span>
                          </div>
                          <div className="rating-badge">4.70/5</div>
                        </div>
                        <p>
                          Contrary to popular belief. Ut tincidunt est ac dolor
                          aliquam sodales. Phasellus sed mauris hendrerit,
                          laoreet sem in, lobortis mauris hendrerit ante.
                        </p>
                      </div>
                      <div className="resume-card">
                        <div className="card-header-resume">
                          <div className="text-content">
                            <h4>The Personal Portfolio Mystery</h4>
                            <span>Job at Rainbow-Themes (2008 - 2016)</span>
                          </div>
                          <div className="rating-badge">4.95/5</div>
                        </div>
                        <p>
                          Generate Lorem Ipsum which looks. Ut tincidunt est ac
                          dolor aliquam sodales. Phasellus sed mauris hendrerit,
                          laoreet sem in, lobortis mauris hendrerit ante.
                        </p>
                      </div>
                      <div className="resume-card">
                        <div className="card-header-resume">
                          <div className="text-content">
                            <h4>Diploma in Computer Science</h4>
                            <span>
                              Works at Plugin Development (2016 - 2020)
                            </span>
                          </div>
                          <div className="rating-badge">5.00/5</div>
                        </div>
                        <p>
                          Maecenas finibus nec sem ut imperdiet. Ut tincidunt
                          est ac dolor aliquam sodales. Phasellus sed mauris
                          hendrerit, laoreet sem in, lobortis mauris hendrerit
                          ante.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: SKILLS (Fixed: No Testimonials) ================= */}
              {activeTab === "skills" && (
                <div className="row fade-in">
                  {/* Design Skills */}
                  <div className="col-lg-6 col-md-12">
                    <div className="skill-wrapper">
                      <span className="skill-sub">Features</span>
                      <h3 className="skill-title">Design Skill</h3>

                      <div className="skill-item">
                        <div className="skill-header">
                          <h6>PHOTOSHOP</h6>
                          <span>100%</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="skill-item">
                        <div className="skill-header">
                          <h6>FIGMA</h6>
                          <span>95%</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{ width: "95%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="skill-item">
                        <div className="skill-header">
                          <h6>ADOBE XD</h6>
                          <span>60%</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{ width: "60%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="skill-item">
                        <div className="skill-header">
                          <h6>ADOBE ILLUSTRATOR</h6>
                          <span>70%</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{ width: "70%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="skill-item">
                        <div className="skill-header">
                          <h6>DESIGN</h6>
                          <span>90%</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{ width: "90%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Development Skills */}
                  <div className="col-lg-6 col-md-12">
                    <div className="skill-wrapper">
                      <span className="skill-sub">Features</span>
                      <h3 className="skill-title">Development Skill</h3>

                      <div className="skill-item">
                        <div className="skill-header">
                          <h6>HTML</h6>
                          <span>85%</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{ width: "85%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="skill-item">
                        <div className="skill-header">
                          <h6>CSS</h6>
                          <span>80%</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{ width: "80%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="skill-item">
                        <div className="skill-header">
                          <h6>JAVASCRIPT</h6>
                          <span>90%</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{ width: "90%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="skill-item">
                        <div className="skill-header">
                          <h6>SOFTWARE</h6>
                          <span>75%</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{ width: "75%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="skill-item">
                        <div className="skill-header">
                          <h6>PLUGIN</h6>
                          <span>70%</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar"
                            style={{ width: "70%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 3: EXPERIENCE ================= */}
              {activeTab === "experience" && (
                <div className="row fade-in">
                  {/* Left Column */}
                  <div className="col-lg-6 col-md-12">
                    <div className="timeline-heading">
                      <span>2010 - 2022</span>
                      <h3>Company Experience</h3>
                    </div>
                    <div className="timeline-wrapper">
                      <div className="resume-card">
                        <div className="card-header-resume">
                          <div className="text-content">
                            <h4>Sr. Software Engineer</h4>
                            <span>Google Inc. (2018 - Present)</span>
                          </div>
                          <div className="rating-badge">4.9/5</div>
                        </div>
                        <p>
                          Developing scalable web applications and leading the
                          frontend team. Responsible for code reviews and system
                          architecture design.
                        </p>
                      </div>
                      <div className="resume-card">
                        <div className="card-header-resume">
                          <div className="text-content">
                            <h4>Web Developer</h4>
                            <span>Adobe Systems (2015 - 2018)</span>
                          </div>
                          <div className="rating-badge">4.7/5</div>
                        </div>
                        <p>
                          Worked on Adobe Creative Cloud web interface.
                          Implemented responsive designs and optimized
                          performance for global users.
                        </p>
                      </div>
                      <div className="resume-card">
                        <div className="card-header-resume">
                          <div className="text-content">
                            <h4>UI/UX Designer</h4>
                            <span>Discord (2013 - 2015)</span>
                          </div>
                          <div className="rating-badge">4.5/5</div>
                        </div>
                        <p>
                          Designed user-friendly interfaces for the Discord
                          mobile application. Conducted user research and
                          improved engagement.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="col-lg-6 col-md-12">
                    <div className="timeline-heading">
                      <span>2008 - 2013</span>
                      <h3>Field Experience</h3>
                    </div>
                    <div className="timeline-wrapper">
                      <div className="resume-card">
                        <div className="card-header-resume">
                          <div className="text-content">
                            <h4>Freelance Developer</h4>
                            <span>Upwork (2011 - 2013)</span>
                          </div>
                          <div className="rating-badge">4.8/5</div>
                        </div>
                        <p>
                          Delivered 50+ successful projects for international
                          clients. Specialized in WordPress and custom PHP
                          development.
                        </p>
                      </div>
                      <div className="resume-card">
                        <div className="card-header-resume">
                          <div className="text-content">
                            <h4>Junior Web Designer</h4>
                            <span>Creative Agency (2009 - 2011)</span>
                          </div>
                          <div className="rating-badge">4.2/5</div>
                        </div>
                        <p>
                          Assisted senior designers in creating layouts and
                          prototypes. Learned the fundamentals of HTML, CSS, and
                          jQuery.
                        </p>
                      </div>
                      <div className="resume-card">
                        <div className="card-header-resume">
                          <div className="text-content">
                            <h4>Intern</h4>
                            <span>TechStart Inc. (2008 - 2009)</span>
                          </div>
                          <div className="rating-badge">4.0/5</div>
                        </div>
                        <p>
                          Gained hands-on experience in software development
                          lifecycles. Participated in daily stand-ups and agile
                          sprints.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 4: INTERVIEW ================= */}
              {activeTab === "interview" && (
                <div className="row fade-in">
                  {/* Left Column */}
                  <div className="col-lg-6 col-md-12">
                    <div className="timeline-heading">
                      <span>2018 - 2023</span>
                      <h3>Company Interview</h3>
                    </div>
                    <div className="timeline-wrapper">
                      <div className="resume-card">
                        <div className="card-header-resume">
                          <div className="text-content">
                            <h4>Google Interview</h4>
                            <span>Mountain View (2020)</span>
                          </div>
                          <div className="rating-badge">Pass</div>
                        </div>
                        <p>
                          The interview focused on data structures and
                          algorithms. 5 rounds including system design and
                          behavioral checks.
                        </p>
                      </div>
                      <div className="resume-card">
                        <div className="card-header-resume">
                          <div className="text-content">
                            <h4>Amazon Interview</h4>
                            <span>Seattle (2019)</span>
                          </div>
                          <div className="rating-badge">Pass</div>
                        </div>
                        <p>
                          Questions on leadership principles and scalable system
                          architecture. Coding rounds involved dynamic
                          programming.
                        </p>
                      </div>
                      <div className="resume-card">
                        <div className="card-header-resume">
                          <div className="text-content">
                            <h4>Facebook Interview</h4>
                            <span>Menlo Park (2018)</span>
                          </div>
                          <div className="rating-badge">Fail</div>
                        </div>
                        <p>
                          Challenging problem-solving session. Learned a lot
                          about graph theory and efficient database management.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="col-lg-6 col-md-12">
                    <div className="timeline-heading">
                      <span>2015 - 2018</span>
                      <h3>Recruitment Questions</h3>
                    </div>
                    <div className="timeline-wrapper">
                      <div className="resume-card">
                        <div className="card-header-resume">
                          <div className="text-content">
                            <h4>Technical Round</h4>
                            <span>Standard Questions</span>
                          </div>
                          <div className="rating-badge">Hard</div>
                        </div>
                        <p>
                          Explain the difference between SQL and NoSQL
                          databases. How do you handle asynchronous operations
                          in JavaScript?
                        </p>
                      </div>
                      <div className="resume-card">
                        <div className="card-header-resume">
                          <div className="text-content">
                            <h4>HR Round</h4>
                            <span>Cultural Fit</span>
                          </div>
                          <div className="rating-badge">Easy</div>
                        </div>
                        <p>
                          Where do you see yourself in 5 years? Describe a
                          situation where you had a conflict with a colleague.
                        </p>
                      </div>
                      <div className="resume-card">
                        <div className="card-header-resume">
                          <div className="text-content">
                            <h4>Managerial Round</h4>
                            <span>Project Management</span>
                          </div>
                          <div className="rating-badge">Medium</div>
                        </div>
                        <p>
                          How do you prioritize tasks under tight deadlines?
                          Explain a time you failed and how you recovered.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <hr className="hr-1"></hr>
        </section>
      </div>
    </>
  );
};

export default Resume;
