import React from "react";
import Navbar from "../components/Navbar";
import InputMessage from "../components/InputMessage";
import "../styles/MainPage.css"

function MainPage() {
    return (
        <div>
            <Navbar />
            <InputMessage />
        </div>
    );
}

export default MainPage;