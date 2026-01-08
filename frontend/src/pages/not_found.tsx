
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function NotFound() {
    return (
        <div className="container text-center">
            <h1>404 Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <Link to="/" className="btn btn-primary">Go to Home</Link>
        </div>
    );
};

export default NotFound;