import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        Tech Companies Explorer
      </Link>
    </nav>
  );
}
