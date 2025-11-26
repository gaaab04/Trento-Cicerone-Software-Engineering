import Navbar from "../components/Navbar";
import InputMessage from "../components/InputMessage";
import Faqs from "../components/Faqs";
import axios from "axios";
import {API} from "../api.js";
import {useEffect, useState} from "react";
import "../styles/MainPage.css"
import {useNavigate} from "react-router-dom";

function MainPage() {
    const navigate = useNavigate(); // serve per la navigazione tra le pagine
    const [userMessage, setUserMessage] = useState(""); // serve per rendere le faqs cliccabili

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await axios.get(`${API}/api/protected`, { withCredentials: true });
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    try {
                        await axios.get(`${API}/api/refresh`, { withCredentials: true }); // prova ad aggiornare il token
                        await axios.get(`${API}/api/protected`, { withCredentials: true });
                    } catch {
                        navigate('/login');
                    }
                } else {
                    navigate('/login');
                }
            }
        };
        checkAuth();
    }, []);

    return (
        <div className="mainContainer">
            <Navbar />
            <div className="faqsContainer">
                <Faqs setMessage={setUserMessage}/> {/*passo setMessagge per rendere le faqs cliccabili*/}
            </div>
            <InputMessage userMessage={userMessage} setUserMessage={setUserMessage}/> {/* passo message per passare una faq cliccata in input*/}
        </div>
    );
}

export default MainPage;