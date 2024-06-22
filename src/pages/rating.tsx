import * as React from 'react';
import { useState, useEffect } from 'react';
import './rating.css'; // Import the CSS for styling

const labels = [
    "1-\nUnsure",
    "2-Did Not\nAddress",
    "3-Barely\nAddressed",
    "4-Somewhat\nAddressed",
    "5-Addressed",
    "6-Definitely\nAddressed"
];

const RatingComponent = () => {
    const [rating1, setRating1] = useState(1);
    const [rating2, setRating2] = useState(1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = {
            first: rating1,
            second: rating2
        };
        console.log('Sending data to API:', result);


        const response = await fetch(' http://127.0.0.1:5000/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(result)
        });
        const data = await response.json();
        console.log('Response from API:', data);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="slider-container">
                <p>Please provide your rating for your selected Belief #1: There are areas along the dune transect (between crest and interdune) where data is needed</p>
                <div className="slider">
                    <div className="slider-line"></div>
                    {labels.map((label, index) => (
                        <div
                            key={index + 1}
                            className={`slider-point ${rating1 === index + 1 ? 'selected' : ''}`}
                            onClick={() => setRating1(index + 1)}
                        >
                            <span className="slider-label">{label.split('\n').map((line, i) => <div key={i}>{line}</div>)}</span>
                        </div>
                    ))}
                </div>
            </div>
            <br/>
            <div className="slider-container">
                <p>Please provide your rating for your selected Belief #2: There are portions of the dynamic range of the moisture variable (x axis of the data plot) where data is needed</p>
                <div className="slider">
                    <div className="slider-line"></div>
                    {labels.map((label, index) => (
                        <div
                            key={index + 1}
                            className={`slider-point ${rating2 === index + 1 ? 'selected' : ''}`}
                            onClick={() => setRating2(index + 1)}
                        >
                            <span className="slider-label">{label.split('\n').map((line, i) => <div key={i}>{line}</div>)}</span>
                        </div>
                    ))}
                </div>
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default RatingComponent;
