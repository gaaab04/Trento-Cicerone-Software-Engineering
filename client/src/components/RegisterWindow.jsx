import React from "react";
import "../styles/RegisterWindow.css"
import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";

function RegisterWindow() {
    // per memorizzare i dati del form; tutti i campi sono inizialmente vuoti
    const[email, setEmail] = useState('');
    const[password, setPassword] = useState('');
    const[confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    const isValidPassword = (password) => {
        const errors = [];
        if (!password || password.length < 8) errors.push("La password deve essere lunga almeno 8 caratteri");
        if (password.length > 16) errors.push("La password non può superare i 16 caratteri");
        if (!/[a-z]/.test(password)) errors.push("La password deve contenere almeno una lettera minuscola");
        if (!/[A-Z]/.test(password)) errors.push("La password deve contenere almeno una lettera maiuscola");
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("La passwod deve contenere almeno un carattere speciale");
        return errors;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Le password non corrispondono");
            return;
        }

        // validazione email lato frontend
        if (!isValidEmail(email)) (
            alert("Email non valida. Inserisci un indirizzo corretto")
        )

        //validazione password lato frontend
        const passwordErrors = isValidPassword(password);
        if (passwordErrors.length > 0) {
            alert("Password non valida:\n\n" + passwordErrors.join("\n"));
            return;
        }

        axios.post('http://localhost:5001/api/register', {email, password})
            .then(result => {
                console.log(result)

                if (result.data.message === "Questa mail è già in uso") {
                    alert ("Mail già in uso. Controlla di aver scritto correttamente la tua email oppure accedi")
                }
                else {
                    navigate('/login')
                }
            })
            .catch(err => console.log(err))
    }


    return (
        <div className="mainWrapper">  {/* wrapper principale*/}
            <div className="titoloApp">
                <p className="titoloAppText1">Trento</p>
                <p className="titoloAppText2">Cicerone</p>
            </div>
            <p className="loginText">Registrati ora</p>
            <form onSubmit={handleSubmit}>
                <input className="inputEmail"
                       type="email"
                       placeholder="Email"
                       onChange={(e) => setEmail(e.target.value)}
                       required
                />
                <input className="inputPassword"
                       type="password"
                       placeholder="Password"
                       onChange={(e) => setPassword(e.target.value)}
                       required
                />
                <input className="inputPassword"
                       type="password"
                       placeholder="Conferma Password"
                       onChange={(e) => setConfirmPassword(e.target.value)}
                       required
                />

                <div className="registerButtonWrapper">
                    <button className="registerButton">Registrati</button>
                </div>
            </form>
            <p className="registerText">Hai già un account? <Link className="linkToLogin" to={"/login"}>Accedi</Link></p>

        </div>

    );
}

export default RegisterWindow;



