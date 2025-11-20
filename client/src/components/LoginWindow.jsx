import React from "react";
import "../styles/LoginWindow.css"
import {useState} from "react";
import axios from "axios";
import {Link, useNavigate} from "react-router-dom";


function LoginWindow() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    axios.defaults.withCredentials = true;

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5001/api/login', {email, password})
            .then(result => {
                console.log(result)
                if (result.data.message === "Password corretta") {
                    navigate('/')
                }

                else if (result.data.message === "nessuna corrispondenza trovata") {
                    alert("Email non trovata. Controlla di aver scritto correttamente la tua email oppure registrati")
                }

                else if (result.data.message === "la password non corrisponde") {
                    alert("Password errata")
                }
                else {
                    alert("Errore nel server")
                }


            })
            .catch(err => console.log(err))
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



