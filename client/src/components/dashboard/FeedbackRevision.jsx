import "../../styles/dashboard/FeedbackRevision.css"
import ThumbsUp from "../../assets/thumbs-up.svg"
import ThumbsDown from "../../assets/thumbs-down.svg"
import RightArrow from "../../assets/rightArrow.svg"
import { useEffect, useState } from "react";
import { API } from "../../api.js";
import axios from "axios";
import {Modal} from "../Modal.jsx";
import ReactMarkdown from "react-markdown";


function FeedbackRevision () {
    // stati principali
    const [feedbacks, setFeedbacks] = useState([]);             // lista feedback recuperati dak server
    const [chatToSee, setChatToSee] = useState([]);             // messaggi della chat da mostrare nel modal
    const [showModal, setShowModal] = useState(false);        // stato visibilità del modal
    const [highlightedMsgId, setHighlightedMsgId] = useState(null);    // id del messaggio da evidenziare (ossia il messaggio che ha ricevuto il feedback)
    const [highlightType, setHighlightType] = useState(null);          // tipo di evidenziazione del messaggio (positivo = verde, negativo = rosso)

    // stati per i filtri
    const [filterType, setFilterType] = useState("");           // filtro per tipo di feedback
    const [filterDate, setFilterDate] = useState("");           // filtro per data
    const [activeDate, setActiveDate] = useState(false);      // se il filtro data è attivo

    // recupera i feedback
    const  fetchFeedbacks = async () => {
        try {
            // salvo il risultato della chiamata nello stato
            const res = await axios.get(`${API}/api/dashboard/feedback`, {withCredentials: true});
            setFeedbacks(res.data);
        }
        catch(error) {
            console.log("Errore durante il recupero dei feedback: ", error);
        }
    }

    useEffect(() => {
        fetchFeedbacks();
    }, [])

    // mostra la chat completa per un feedback
    const handleShowMoreInfo = async (sessionId, messageId, feedbackType) => {
        try {
            const res = await axios.get(`${API}/api/chat/${sessionId}`, {withCredentials: true});
            setChatToSee(res.data);             // imposta i messaggi della chat
            setHighlightedMsgId(messageId);     // imposta il messaggio da evidenziare
            setHighlightType(feedbackType);     // tipo di evidenziazione (verde per feedback positivo e rosso per negativo)
            setShowModal(true);           // mostra il modal
        } catch(error) {
            alert("Errore durante il recupero dello storico della chat");
            console.log("Errore durante il recupero dei feedback: ", error);
        }
    }

    // funzione che applica i filtri
    const filteredFeedbacks = feedbacks
        // filtro per tipo (positivo o negativo)
        .filter(feedback => {
            if (!filterType) return true;
            return feedback.feedback === filterType ;
        })
        // filtro per data
        .filter(feedback => {
            if (!filterDate) return true;
            const fbDate = feedback.createdAt.split("T")[0];
            return fbDate === filterDate;
        })

    return (
        <div className="feedbackRevision">
            <h3>Revisione feedback</h3>

            <div className="feedbackRevisionMainWrapper">

                <div className="filtersSection">
                    <select onChange={(e) => setFilterType(e.target.value)} value = {filterType}>
                        <option value="">Filtra per tipo</option>
                        <option value="positive">Positivo</option>
                        <option value="negative">Negativo</option>
                    </select>
                    {activeDate ? (
                        <input
                            type="date"
                            className="dateFilterInput"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    ):(
                        <button
                            onClick={() => {
                                setActiveDate(true);
                                const today = new Date();
                                const year = today.getFullYear();
                                const month = String(today.getMonth() + 1).padStart(2, "0");
                                const day = String(today.getDate()).padStart(2, "0");
                                setFilterDate(`${year}-${month}-${day}`);
                            }}>
                            Filtra per data
                        </button>
                        )
                    }
                    <button onClick={() => {
                        setFilterType("");
                        setFilterDate("");
                        setActiveDate(false);
                    }}>
                        Azzera i filtri
                    </button>

                </div>

                {filteredFeedbacks.length > 0 ? (
                    filteredFeedbacks.map((feedback) => (
                        <div key={feedback._id} className = "feedbackEntity">
                            <div className="feedbackEntityInfo">
                                {feedback.feedback === 'positive'
                                    ? <img src={ThumbsUp} alt="" />
                                    : <img src={ThumbsDown} alt="" />}
                                <p>{feedback.createdAt.split("T")[0]}</p>
                            </div>

                            <div className="feedbackEntityContent">
                                {feedback.comment != "" ? (
                                    <>
                                        <p className="feedbackEntityContentTitle">Commento utente</p>
                                        <p className="feedbackEntityContentBody">{feedback.comment}</p>
                                    </>
                                    ) : (
                                        <p className="feedbackEntityContentTitle">L'utente non ha lasciato commenti</p>
                                    )}
                            </div>
                            <div className="feedbackEntitySeeMore">
                                <button onClick={() => handleShowMoreInfo(feedback.sessionId, feedback._id, feedback.feedback)}>
                                    <p>Vedi di più</p>
                                    <img src={RightArrow} alt="see more"/>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (<p>Nessun feedback attualmente</p>)}
            </div>

            {/* modal che mostra la chat completa dato un feedback */}
            <Modal shouldShow={ showModal } onRequestClose = { () => {
                setShowModal(false);
                setChatToSee([]);
            }}>
                <h3>Storico chat</h3>
                <div className="fbChatContainer">
                    {chatToSee.map((msg) => {

                        const higlightMsg = msg._id === highlightedMsgId;
                        const highlightColor = higlightMsg ? {
                            backgroundColor: highlightType === 'positive' ? "rgba(40, 167, 69, 0.4)" : "rgba(192, 57, 43, 0.4)"
                        } : {}

                        return (
                            <div key={msg._id} className={`chatMessageWrapper ${msg.role === 'user' ? 'userWrapper' : 'botWrapper'}`}>
                                <div className={`chatMessage ${msg.role === "user" ? "user" : "bot"}`} style={highlightColor}>
                                    <ReactMarkdown>{msg.content}</ReactMarkdown> {/* il messaggio del bot è spesso in markdown */}
                                </div>
                        </div>
                    )})}
                </div>
            </Modal>
        </div>
    )
}

export default FeedbackRevision;