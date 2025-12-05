import { useState } from 'react';
import './formexample.css';

const SubmitFormexample = () => {

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

    function handleSubmit(e) {
        e.preventDefault();
        alert(
            "Registered Name: " + data.name +
            "\nRegistered Email: " + data.email +
            "\nRegistered Gender: " + data.gender +
            "\nRegistered Password: " + data.password
        );
    }


    return (
        <>
            <div class="form-body">
                <div class="row">
                    <div class="form-holder">
                        <div class="form-content">
                            <div class="form-items">
                                <h3>React Form Example with Submit Button</h3>
                                <p>Fill in the data below.</p>

                                <form class="requires-validation" onSubmit={handleSubmit} noValidate>

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

                                    </div>

                                    {/* SUBMIT BUTTON */}
                                    <div class="form-button mt-3">
                                        <button id="submit" type="submit" class="btn btn-primary">Register</button>
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

export default SubmitFormexample;
