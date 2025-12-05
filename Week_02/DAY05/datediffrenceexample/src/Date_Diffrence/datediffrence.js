import React, { useState } from "react";
import "./datediffrence.css";

const DateDifference = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [message, setMessage] = useState("Select dates to get started");

    const calculateDifference = () => {
        if (!startDate || !endDate) {
            setMessage("Please select both dates");
            return;
        }

        const sDate = new Date(startDate);
        const eDate = new Date(endDate);

        const diffTime = eDate - sDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            setMessage("End date must be greater than start date");
        } else {
            setMessage(`Difference between the two dates is ${diffDays} days`);
        }
    };

    const resetForm = () => {
        setStartDate("");
        setEndDate("");
        setMessage("Select dates to get started");
    };

    return (
        <div className="date-bg">
            <div className="glass-card">

                <h2 className="title">Calculate Date Difference</h2>

                <div>
                    <label>Start Date</label>
                    <input
                        type="date"
                        className=""
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    
                    />

                    <label>End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                <div className="btn-box">
                    <button className="btn calculate" onClick={calculateDifference}>
                        Calculate
                    </button>

                    <button className="btn reset" onClick={resetForm}>
                        Reset
                    </button>
                </div>

                <p className="result-text">{message}</p>
            </div>
        </div>
    );
};

export default DateDifference;
