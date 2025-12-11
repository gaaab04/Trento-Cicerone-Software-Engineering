//Questo componente é per la navbar
import React, {useEffect, useState} from "react";
import "../styles/Navbar.css";
import {Link} from "react-router-dom";
import axios from "axios";
import {API} from "../api.js";


function Navbar() {
    const [role, setRole] = useState("");

    const getRole = async () => {
        try {
            const res = await axios.get(`${ API }/api/users/me`)
            setRole(res.data.role);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getRole();
    }, [])

    return (
    <nav className="navbar">
      <div className="navbar-logo">Trento Cicerone</div>
      <ul className="navbar-links">
          {(role === "operator" || role === "admin") && (
              <li><Link to={"/dashboard"}>Dashboard</Link></li>
          )}
          <li><Link to={"/profile"}>Profilo</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;



