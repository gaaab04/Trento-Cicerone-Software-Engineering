import React from "react";
import LoginWindow from "../components/LoginWindow";
import loginImage from "../assets/login_image.png";
import "../styles/LoginPage.css"

function TestPage() {
    return (
        <div className="TestPage">
            <img src={loginImage} alt="Login" className="loginImage" />
            <div className="loginSection">
                <LoginWindow />
            </div>
        </div>
    );
}

export default TestPage;