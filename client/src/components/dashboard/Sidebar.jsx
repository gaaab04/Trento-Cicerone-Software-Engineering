import React, {useEffect, useState} from "react";
import "../../styles/dashboard/Sidebar.css"
import Hamburger from "../../assets/menu.svg"
import CloseMenu from "../../assets/xmark.svg"
import {Link} from "react-router-dom";
import axios from "axios";
import {API} from "../../api.js";

function Sidebar({activeView, setActiveView}) {
    const [isOpen, setIsOpen] = useState(false); // stato per sapere se la sidebar è aperta o chiusa
    const [role, setRole] = useState("");         // stato che tiene traccia del ruolo dell'utente

    useEffect(() => {
        async function getRole() {
            try {
                const res = await axios.get(`${API}/api/users/me`, {withCredentials: true});
                setRole(res.data.role);
            }
            catch (error) {
                console.error("Errore durante recupero del ruolo utente nella sidebar:", error);
            }
        } getRole();
    }, [])

    // funzione per aprire o chiudere la sidebar
    function toggleSidebar() {
        setIsOpen(!isOpen);
    }

    // funzione per chiudere la sidebar
    function closeSidebar() {
        setIsOpen(false);
    }

    // funzione per gestire il cambio del componente attivo
    function handleViewChange(view) {
        setActiveView(view);
        closeSidebar();
    }

    // variabile per decidere quale classe CSS usare
    let sidebarClass = "sidebar";
    if (isOpen) {
        sidebarClass = "sidebar sidebar-open";
    }

    return (
        <div>
            {/* topbar per tablet e schermi piu piccoli */}
            <div className="topbar-mobile">
                <span className="topbar-title">Trento Cicerone</span>
                <button className="hamburgerButton" onClick={toggleSidebar}>
                    <img src={Hamburger} alt="Menu" />
                </button>
            </div>

            {/* sidebar per schermi piu grandi di tablet */}
            <div className={sidebarClass}>
                <button className="close-sidebar-btn" onClick={closeSidebar}>
                    <img src={CloseMenu} alt="Chiudi" />
                </button>
                <div className="appLogo">
                    <p className="titoloAppText1">Trento</p>
                    <p className="titoloAppText2">Cicerone</p>
                </div>
                <div className="sidebarLinks">
                    <ul>
                        <li onClick={() => handleViewChange("dashboard")} className={activeView === "dashboard" ? "active" : ""}>Dashboard Operatore</li>
                        <li onClick={() => handleViewChange("documenti")} className={activeView === "documenti" ? "active" : ""}>Gestione documenti</li>
                        <li onClick={() => handleViewChange("faq")} className={activeView === "faq" ? "active" : ""}>Gestione FAQs</li>
                        <li onClick={() => handleViewChange("feedback")} className={activeView === "feedback" ? "active" : ""}>Revisione feedback</li>
                        <li onClick={() => handleViewChange("utenti")} className={activeView === "utenti" ? "active" : ""}>Gestione utenti</li>
                        <li onClick={() => handleViewChange("domande")} className={activeView === "domande" ? "active" : ""}>Domande recenti</li>
                        {(role === "admin") && (
                            <li onClick={() => handleViewChange("admin")} className={activeView === "admin" ? "active" : ""}>Gestione operatori</li>
                        )}
                        <li><Link to={"/profile"} className={"profileLink"}>Profilo</Link></li>
                    </ul>
                </div>
            </div>

            {/* overlay per chiudere la sidebar cliccando fuori */}
            {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
        </div>
    )
}

export default Sidebar;