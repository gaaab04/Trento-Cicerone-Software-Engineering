import React, {useEffect, useState} from "react";
import "../styles/ProfilePage.css"
import {Link, useNavigate} from "react-router-dom";
import {API} from "../api.js";
import axios from "axios";

function ProfilePage() {
    const [user, setUser] = useState({email: "", role: ""});
    const [loading, setLoading] = useState(true);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");


    const navigate = useNavigate();
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${API}/api/users/me`, {withCredentials: true});
                let userRole = response.data.role;
                if (userRole === 'admin') userRole = 'Amministratore';
                else if (userRole === 'operator') userRole = 'Operatore';
                else if (userRole === 'user') userRole = 'Utente';
                setUser({email: response.data.email, role: userRole})
                setLoading(false);
            } catch (error) {
                console.error('Errore durante il recupero del profilo:', error);
                setLoading(false);
                if (error.response.status === 401) {
                    alert("Non sei autorizzato ad accedere a questa pagina. Effettua il login");
                    navigate("/login")
                }
                else if (error.response.status === 403) {
                    alert("Non sei autorizzato ad accedere a questa pagina")
                    navigate("/")
                }
                else {
                    alert("Errore nel recupero dati")
                    navigate("/")
                }
            }
        };
        fetchProfile();
    },[])


    if (loading) return <div className="profilePage">Caricamento profilo in corso...</div>;

    const isValidPassword = (password) => {
        const errors = [];
        if (!password || password.length < 8) errors.push("La password deve essere lunga almeno 8 caratteri");
        if (password.length > 16) errors.push("La password non può superare i 16 caratteri");
        if (!/[a-z]/.test(password)) errors.push("La password deve contenere almeno una lettera minuscola");
        if (!/[A-Z]/.test(password)) errors.push("La password deve contenere almeno una lettera maiuscola");
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("La passwod deve contenere almeno un carattere speciale");
        return errors;
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if(!oldPassword || !newPassword) return alert("Compila tutti i campi");

        const passwordErrors = isValidPassword(newPassword);
        if (passwordErrors.length > 0) {
            alert("Password non valida:\n\n" + passwordErrors.join("\n"));
            return;
        }

        try {
            await axios.patch(
                `${API}/api/users/changePassword`,
                {oldPassword, newPassword},
                {withCredentials: true}
            )

            alert("Password cambiata con successo");
            setOldPassword("");
            setNewPassword("");

        } catch (error) {
            if (error.response.status === 401) {
                alert("Password vecchia errata. Riprova");
            }
            else if (error.response.status === 400) {
                alert(error.response.data.message);
            }
            else {
                alert("Errore durante il cambio password. Riprova più tardi");
            }
        }
    }

    const handleLogout = async () => {
        try {
            // rimuovo il token dal localStorage (anche se non dovrei averne)
            localStorage.removeItem('token');

            await axios.post(`${API}/api/logout`, {}, {withCredentials: true});
            navigate("/login")
        } catch (error) {
            console.error('Errore durante il logout:', error);
            alert("Non è stato possibile eseguire il logout. Riprova più tardi");
        }
    }


    return (
        <div className="profilePage">
            <div className="mainWrapper">
                <div className="appLogo">
                    <p className="titoloAppText1">Trento</p>
                    <p className="titoloAppText2">Cicerone</p>
                </div>
                <p className="pageTitle">Il tuo profilo personale</p>
                <div className="profileInfoWrapper">
                    <div className="infoSection">
                        <p className="infoTitle">Email</p>
                        <p className="infoText">{user.email}</p>
                    </div>
                    <div className="infoSection">
                        <p className="infoTitle">Ruolo</p>
                        <p className="infoText">{user.role}</p>
                    </div>
                    <div className="infoSection">
                        <p className="infoTitle">Cambio password</p>
                        <form onSubmit={handlePasswordChange}>
                            <input className="inputPassword"
                                   type="password"
                                   placeholder="Inserisci la vecchia password"
                                   value = {oldPassword}
                                   onChange={(e) => setOldPassword(e.target.value)}
                            />
                            <input className="inputPassword"
                                   type="password"
                                   placeholder="Inserisci la nuova password"
                                   value = {newPassword}
                                   onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button className="changePasswordButton">Cambia password</button>
                        </form>
                    </div>
                </div>

                <button className="logoutButton" onClick={handleLogout}>Logout</button>
                <Link className="backToHome" to={'/'}>Torna alla home</Link>
            </div>



        </div>
    )
}

export default ProfilePage;