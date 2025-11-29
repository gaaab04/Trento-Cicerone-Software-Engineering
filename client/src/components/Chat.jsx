import {useEffect, useRef, useState} from "react";
import ReactMarkdown from "react-markdown";
import "../styles/Chat.css";
import axios from "axios";
import {API} from "../api.js";
import ThumbsUp from "../assets/thumbs-up.svg";
import ThumbsDown from "../assets/thumbs-down.svg";

function Chat({ messages }) {
    const messagesEndRef = useRef(null);
    const [popup, setPopup] = useState({open: false, messageId: null, type: null, comment: ""});

    // scroll automatico quando viene aggiunto un nuovo messaggio
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    // gestisce invio feedback inviando la richiesta al backend e chiude il popup
    const handleFeedback = async (messageId, feedbackType, comment) => {
        try {
            await axios.post(`${API}/api/chat/${messageId}/feedback`, { feedback: feedbackType, comment: comment}, { withCredentials: true });
        } catch (error) {
            console.error(error.message);
            alert("Erorre durante l'invio del feedback");
        } finally {
            setPopup ({open: false, messageId: null, type: null, comment: ""});
        }
    }


    return (
        <div className="chatContainer">
            {messages.map((msg, idx) => {
                // se il messaggio è del bot e sta caricando si mostrano i 3 pallini che saltano
                if (msg.role === 'assistant' && msg.loading) {
                    return (
                        <div key={idx} className="chatMessageLoading">
                            <div className="chatLoadingDots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    );
                }

                // aggiunge il link alla fine del mex se è presente (content è in formato markdown)
                let content = msg.content;
                if (msg.role === 'assistant' && msg.source) {
                    content += `\n\nSe vuoi maggiori informazioni vai a: [${msg.source}](${msg.source})`;
                }

                return (
                    <div
                        key={idx}
                        className={`chatMessageWrapper ${msg.role === 'user' ? 'userWrapper' : 'botWrapper'}`}>
                        <div className={`chatMessage ${msg.role === "user" ? "user" : "bot"}`}>
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>

                        {msg.role === 'assistant' && msg.messageId && (
                            <div className="feedbackButtons">
                                <img src={ThumbsUp} alt="thumbsup" onClick={() => setPopup({open: true, messageId: msg.messageId, type: 'positive', comment: ''})}/>
                                <img src={ThumbsDown} alt = "thumbsdown" onClick ={() => setPopup({open: true, messageId: msg.messageId, type: 'negative', comment: ''})}/>
                            </div>
                        )}
                    </div>
                );
            })}
            <div ref={messagesEndRef} />

            {popup.open && (
                <div className="feedbackPopupOverlay">
                    <div className="feedbackPopup">
                        <h3>Feedback</h3>
                        <textarea className="feedbackTextArea"
                                  placeholder="Scrivi un commento (opzionale)"
                                  value = {popup.comment}
                                  onChange={(e) => setPopup(prev => ({...prev, comment: e.target.value}))}
                                  />
                        <div className="feedbackPopupButtons">
                            <button onClick={() => setPopup({open: false, messageId: null, type: null, comment: ""})}>Chiudi</button>
                            <button onClick={() => handleFeedback(popup.messageId, popup.type, popup.comment)}>Invia</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Chat;