import { Link } from "react-router-dom";
import { Dropdown } from "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./pizza_navbar.css";
import { useEffect } from "react";

function PizzaNav() {
    useEffect(() => {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            new Dropdown(dropdown as any);
        });
    }, []);

    return (
        <>
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                <a className="navbar-brand">
                    Shmackled's Pizza
                </a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link to="/" className="nav-link">Menu</Link>
                        </li>

                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Managers
                            </a>
                            <ul className="dropdown-menu">
                                <li><Link to="/sizes" className="dropdown-item">Sizes Manager</Link></li>
                                <li><Link to="/sauces" className="dropdown-item">Sauces Manager</Link></li>
                                <li><Link to="/crusts" className="dropdown-item">Crusts Manager</Link></li>
                                <li><Link to="/toppings" className="dropdown-item">Toppings Manager</Link></li>
                                <li><Link to="/topping_categories" className="dropdown-item">Topping Categories Manager</Link></li>
                                <li><Link to="/pizza_builder" className="dropdown-item">Pizza Builder</Link></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
        <br />
        </>
    );
}

export default PizzaNav;