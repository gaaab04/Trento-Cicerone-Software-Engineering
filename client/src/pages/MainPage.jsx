import Navbar from "../components/Navbar";
import InputMessage from "../components/InputMessage";
import Faqs from "../components/Faqs";
import Chat from "../components/Chat";
import axios from "axios";
import {API} from "../api.js";
import {useEffect, useState} from "react";
import "../styles/MainPage.css"
import {useNavigate} from "react-router-dom";
import BannedAccount from "../components/BannedAccount.jsx";

function MainPage() {
    const navigate = useNavigate(); // serve per la navigazione tra le pagine
    const [userMessage, setUserMessage] = useState(""); // serve per rendere le faqs cliccabili
    const [messages, setMessages] = useState([]);
    const [isChatting, setIsChatting] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [isBanned, setIsBanned] = useState(false);

    // verifica che l'utente sia loggato
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
                } else if (err.response && err.response.status === 403) {
                    setIsBanned(true);
                } else {
                    navigate('/login');
                }
            }
        };
        checkAuth();
    }, []);

    // genera un codice sessione quando viene caricata la pagina
    useEffect(() => {

        // evita di creare codice sessione se l'utente è bannato
        if (isBanned) return;

        const createSession = async () => {
            try {
                const res = await axios.get(`${API}/api/chat/session`, { withCredentials: true });
                setSessionId(res.data.sessionId);
            } catch (error) {
                console.error('Errore durante la creazione della sessione:', error);
            }
        }; createSession();
    }, []);


    // questa funzione parte quando si preme il bottone di invio
    const handleSendMessage = async (message) => {
        // se l'utente non ha scritto nulla oppure si deve ancora generare l'id della sessione non fa nulla
        if (!message.trim() || !sessionId) return;

        // se l'utente ha scritto qualcosa, cambia lo stato di chatting in modo da cambiare il componente visualizzato
        setIsChatting(true);

        // aggiunge subito il messaggio utente alla chat
        const userMsg = { role: 'user', content: message };
        setMessages(prev => [...prev, userMsg]);
        setUserMessage("");

        // aggiunge messaggio "loading" per l'animazione di caricamento con i 3 pallini che saltellano
        const loadingMsg = { role: 'assistant', loading: true };
        setMessages(prev => [...prev, loadingMsg]);

        try {
            // chiamata al backend per ottenere la risposta
            const res = await axios.post(`${API}/api/chat`, {
                message,
                sessionId: sessionId,
            });

            //aggiorna i messaggi rimuovendo il loading e aggiungendo il messaggio di gemini
            setMessages(prev => {
                const withoutLoading = prev.filter(m => !m.loading); // elimina il messaggio di loading
                const botMsg = {
                    role: 'assistant',
                    content: res.data.response,
                    source: res.data.mainSource,
                    messageId: res.data.messageId
                };
                //aggiorna la chat con la rispsota
                return [...withoutLoading, botMsg];
            });

        } catch (error) {
            // controlla se l'errore è un ban
            if (error.response && error.response.status === 403) {
                setIsBanned(true);
                return;
            }

            console.error('Errore durante l\'invio del messaggio:', error);

            // stesso pattern per l'errore
            setMessages(prev => {
                const withoutLoading = prev.filter(m => !m.loading);
                const errorMsg = { role: 'assistant', content: "Errore nel server. Riprova." };
                return [...withoutLoading, errorMsg];
            });
        }
    };

    if (isBanned) {
        return (
            <BannedAccount />
        )
    }

    return (
        <div className="mainContainer">
            <Navbar />
            <div className="faqsContainer">
                {!isChatting ? (
                <Faqs setMessage={setUserMessage}/>
            ) : (<Chat messages = {messages}/>
                    )}
            </div>
            <InputMessage userMessage={userMessage} setUserMessage={setUserMessage} onSend={handleSendMessage}/> {/* passo message per passare una faq cliccata in input*/}
        </div>
    );
}

export default MainPage;