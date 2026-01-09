
import { Link } from "react-router-dom";
import React from "react";
import PizzaNav from "../page_related/pizza_navbar.tsx";
import "bootstrap/dist/css/bootstrap.min.css";

function NotFound() {
    return (
        <>
            <div>
                <PizzaNav />
            </div>
            <div className="container text-center">
                <h1>404 Not Found</h1>
                <p>The page you are looking for does not exist.</p>
            </div>
        </>
    );
};

export default NotFound;