//Questo componente é per la navbar
import React from "react";
import "../styles/Navbar.css";
import {Link} from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">Trento Cicerone</div>
      <ul className="navbar-links">
        <li><a href="#">About</a></li>
          <li><a href="#"><Link to={"/profile"}>Profilo</Link></a></li>
      </ul>
    </nav>
  );
}

export default Navbar;



