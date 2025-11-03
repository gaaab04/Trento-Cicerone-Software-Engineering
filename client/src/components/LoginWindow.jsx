import React from "react";
import "../styles/LoginWindow.css"
import {useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import {GoogleLogin} from "@react-oauth/google";

function LoginWindow() {
    const navigate = useNavigate();
    return (
        <div className="mainWrapper">
            <div className="titoloApp">
                <p className="titoloAppText1">Trento</p>
                <p className="titoloAppText2">Cicerone</p>
            </div>
            <p className="loginText">Accedi o Registrati ora</p>

            <GoogleLogin
                onSuccess={(credentialResponse) => {
                    console.log(credentialResponse) //mostra nella console il contenuto della risposta
                    console.log(jwtDecode(credentialResponse.credential)) //usa il parser jwt per avere mail e altri dati
                    navigate("/") //va alla main page
                }
                }
                onError={() => console.log("Login fallito")} //stampa nella console messaggio di errore
                auto_select={true} //tenta automaticamente di selezionare lo stesso account google
                logo_alignment={"left"}
                shape={"circle"}
                type={"standard"}
            />
        </div>

    );
}

export default LoginWindow;



