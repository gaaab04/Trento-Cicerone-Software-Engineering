import Navbar from "../components/Navbar";
import InputMessage from "../components/InputMessage";
import axios from "axios";
import {useEffect} from "react";
import "../styles/MainPage.css"
import {useNavigate} from "react-router-dom";

function MainPage() {
    const navigate = useNavigate(); // serve per la navigazione tra le pagine

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await axios.get('http://localhost:5001/api/protected', { withCredentials: true });
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    try {
                        await axios.get('http://localhost:5001/api/refresh', { withCredentials: true }); // prova ad aggiornare il token
                        await axios.get('http://localhost:5001/api/protected', { withCredentials: true });
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
        <div>
            <Navbar />
            <InputMessage />
        </div>
    );
}

export default MainPage;