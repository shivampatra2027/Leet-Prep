// src/ErrorPage.jsx
import React from "react";
import { Link } from "react-router-dom";
// import {button} from "shadcn"
export default function ErrorPage() {
    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Oops! Something went wrong 🚧</h1>
            <img
                src="https://cloud.mongodb.com/static/images/sadface.gif"
                alt="Sad face"
                style={{ width: "150px", margin: "20px auto" }}
            />
            <p>The page you’re looking for doesn’t exist or an error occurred.</p>
            <Link to="/">Go back to Home</Link>
        </div>
    );
}
