import { useState } from 'react';
import './formexample.css';

const Formexample = () => {

    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        position: "",
        gender: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({
            ...data,
            [name]: value
        });
    };

    return (
        <>
            <div class="form-body">
                <div class="row">
                    <div class="form-holder">
                        <div class="form-content">
                            <div class="form-items">
                                <h3>React Form Example</h3>
                                <p>Fill in the data below.</p>

                                <form class="requires-validation" noValidate>

                                    {/* NAME */}
                                    <div class="col-md-12">
                                        <input
                                            class="form-control"
                                            type="text"
                                            name="name"
                                            onChange={handleChange}
                                            value={data.name}
                                            placeholder="Full Name"
                                            required
                                        />
                                        <p className='mt-3'>Print Name : {data.name}</p>
                                    </div>

                                    {/* EMAIL */}
                                    <div class="col-md-12">
                                        <input
                                            class="form-control"
                                            type="email"
                                            name="email"
                                            onChange={handleChange}
                                            value={data.email}
                                            placeholder="E-mail Address"
                                            required
                                        />
                                        <p className='mt-3'>Print Email : {data.email}</p>
                                    </div>

                                    {/* POSITION SELECT */}
                                    <div class="col-md-12">
                                        <select
                                            class="form-select mt-3"
                                            name="position"
                                            value={data.position}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option selected disabled value="">Position</option>
                                            <option value="Junior Web Developer">Junior Web Developer</option>
                                            <option value="Senior Web Developer">Senior Web Developer</option>
                                            <option value="Project Manager">Project Manager</option>
                                        </select>
                                        <p className='mt-3'>Print Position : {data.position}</p>
                                    </div>

                                    {/* PASSWORD */}
                                    <div class="col-md-12">
                                        <input
                                            class="form-control"
                                            type="password"
                                            name="password"
                                            onChange={handleChange}
                                            value={data.password}
                                            placeholder="Password"
                                            required
                                        />
                                        <p className='mt-3'>Print Password : {data.password}</p>
                                    </div>

                                    {/* GENDER BUTTON RADIO */}
                                    <div class="col-md-12 mt-3">
                                        <label class="mb-3 mr-1 me-2" for="gender">Gender: </label>

                                        <input
                                            type="radio"
                                            class="btn-check"
                                            name="gender"
                                            id="male"
                                            value="Male"
                                            onChange={handleChange}
                                        />
                                        <label class="btn btn-sm btn-outline-secondary me-2" for="male">Male</label>

                                        <input
                                            type="radio"
                                            class="btn-check"
                                            name="gender"
                                            id="female"
                                            value="Female"
                                            onChange={handleChange}
                                        />
                                        <label class="btn btn-sm btn-outline-secondary me-2" for="female">Female</label>

                                        <input
                                            type="radio"
                                            class="btn-check"
                                            name="gender"
                                            id="secret"
                                            value="Secret"
                                            onChange={handleChange}
                                        />
                                        <label class="btn btn-sm btn-outline-secondary me-2" for="secret">Secret</label>

                                        <p className='mt-3'>Print Gender : {data.gender}</p>
                                    </div>

                                    {/* CHECKBOX */}
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" required />
                                        <label class="form-check-label">I confirm that all data are correct</label>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Formexample;
