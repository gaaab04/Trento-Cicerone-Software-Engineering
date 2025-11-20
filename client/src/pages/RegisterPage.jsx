import React from "react";
import RegisterWindow from "../components/RegisterWindow";
import registerImage from "../assets/login_image.png";
import "../styles/RegisterPage.css"

function RegisterPage() {
    return (
        <div className="registerPage">
            <img src={registerImage} alt="Register" className="loginImage" />
            <div className="registerSection">
                <RegisterWindow />
            </div>
        </div>
    );
}

export default RegisterPage;