import React from "react";
import "../styles/LoginWindow.css"
import {useState} from "react";
import axios from "axios";
import {API} from "../api.js";
import {Link, useNavigate} from "react-router-dom";


function LoginWindow() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    axios.defaults.withCredentials = true;


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/api/login`, {email, password});
            navigate('/')
        }
        catch(err) {
            if (err.response.status === 401) alert("Password errata");
            else if (err.response.status === 404) alert("Email non trovata. Controlla di aver scritto correttamente la tua email oppure registrati");
            else alert("Errore nel server");
        }
    }

    return (
        <div className="mainWrapper">
            <div className="titoloApp">
                <p className="titoloAppText1">Trento</p>
                <p className="titoloAppText2">Cicerone</p>
            </div>

            <p className="loginText">Accesso al portale</p>
            <form onSubmit ={handleSubmit}>
            <input className="inputEmail"
                   type="email"
                   placeholder="Email"
                   onChange={(e)=>setEmail(e.target.value)}
            />

            <input className="inputPassword"
                   type="password"
                   placeholder="Password"
                   onChange={(e)=>setPassword(e.target.value)}
            />

            <div className="loginButtonWrapper">
                <button className="loginButton">Accedi</button>
            </div>
            </form>
            <p className="registerText">Non hai un account? <Link className="linkToRegister" to={"/register"}>Registrati</Link></p>

        </div>

    );
}

export default LoginWindow;



