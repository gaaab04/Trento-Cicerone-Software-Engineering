import "../../styles/dashboard/RecentQuestions.css"
import {useEffect, useState} from "react";
import axios from "axios";
import { API } from "../../api.js";

function RecentQuestions() {
    const [recentQuestions, setRecentQuestions] = useState(null);       // stato per le domande recenti
    const [filterDate, setFilterDate] = useState("");            // stati per filtro data
    const [activeDate, setActiveDate] = useState(false);

    // recupera le domande recenti (attualmente il limite è 500 ma per cambiarlo basta modificare l'ultima parte della chiamata api)
    const fetchRecentQuestions = async () => {
            try {
                const res = await axios.get(`${API}/api/dashboard/last-questions?limit=500`, {withCredentials: true});
                setRecentQuestions(res.data)
            } catch (error) {
                console.error("Errore durante il recupero delle ultime domande", error)
            }
        }

    useEffect(() => {
        fetchRecentQuestions();
    }, [])


        return (
            <div className="recentQuestions">
                <h3>Domande recenti</h3>
                <div className="rqMainWrapper">
                    <div className="filterButtons">
                        <button className="selectNumberOfQuestions" onClick={()=> {
                            setFilterDate("")
                            setActiveDate(false);
                        }}>Mostra tutte</button>
                        {activeDate ? (
                            <input type="date" className="selectNumberOfQuestions" onChange={(e) => setFilterDate(e.target.value)} value={filterDate}/>
                        ): <button className="selectNumberOfQuestions" onClick={()=> {
                            setActiveDate(true)
                            const today = new Date();
                            const year = today.getFullYear();
                            const month = String(today.getMonth() + 1).padStart(2, "0");
                            const day = String(today.getDate()).padStart(2, "0");
                            const formattedDate = year + "-" + month + "-" + day;
                            setFilterDate(formattedDate);
                        }}>Filtra per data</button>}
                    </div>
                    <div className="rqQuestionsContainer">
                     {recentQuestions?.length > 0 ? (
                            recentQuestions
                                .filter((question) => {
                                if (!filterDate) return true;
                                const questionDate = question.createdAt.split("T")[0];
                                return questionDate === filterDate;
                     })
                                .map((question) => (
                                <div className="rqContentWrapper" key={question._id}>
                                    <p className="rqQuestionText">{question.content}</p>
                                    <p className="rqQuestionInfo">{question.createdAt.split("T")[0]}</p>
                                </div>
                            ))
                            ) : <p>Nessuna domanda</p>}
                    </div>
                </div>
            </div>
        )
    }

export default RecentQuestions;