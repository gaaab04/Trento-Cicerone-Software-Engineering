import "../../styles/dashboard/MainDashboardView.css"
import {useEffect, useState} from "react";
import axios from "axios";
import {API} from "../../api.js";

function MainDashboardView() {
    // stato per statistiche feedback
    const [feedbackStats, setFeedbackStats] = useState({
        positive: 0,
        negative: 0,
        total: 0
    });

    // stato per le domande recenti
    const [lastQuestions, setLastQuestions] = useState(null);

    // recupero delle statistiche dei feedback nelle ultime 24 ore
    useEffect(() => {
        async function fetchFeedbackStats() {
            try {
                const res = await axios.get(`${API}/api/dashboard/feedback/stats`, { withCredentials: true });
                setFeedbackStats(res.data);
            } catch (error) {
                console.error('Errore durante il recupero dei dati di feedback:', error);
            }
        }
        fetchFeedbackStats();
    }, []);

    // recupero delle ultime 4 domande poste dagli utenti
    useEffect(() => {
        async function fetchLastQuestions() {
            try {
                const res = await axios.get(`${API}/api/dashboard/last-questions?limit=4`, { withCredentials: true });
                setLastQuestions(res.data);
            } catch (error) {
                console.error('Errore durante il recupero delle domande recenti:', error);
                throw new Error ('Errore durante il recupero delle domande recenti:');
            }
        }
        fetchLastQuestions();
    }, [])


    return (
        <div className="mainDashboardView">
            <h3>Dashboard operatore</h3>
            <div className="dashboardMainwrapper">
                <div className="widget widgetFeedback">
                    <p className="widgetTitle">Feedback nelle ultime 24h</p>
                    <div className="widgetContent">
                        <p className="widgetStat">Risposta utile: {feedbackStats.positive}</p>
                        <p className="widgetStat">Risposta non utile: {feedbackStats.negative}</p>
                        <p className="widgetStat">Feedback totali: {feedbackStats.total}</p>
                    </div>
                    <p className="widgetRedirect">Vai ai feedback</p>
                </div>

                <div className="widget widgetService">
                    <p className="widgetTitle">Stato del servizio</p>
                    <p className="widgetState">Attivo</p>
                    <p>Disattiva il servizio</p>
                </div>

                <div className="widget widgetQuestions">
                    <p className="widgetTitle">Domande recenti</p>
                    <div className="widgetContent">
                        {lastQuestions?.length > 0 ? (
                            lastQuestions.map((question) => (
                                <p key = {question._id}> - {question.content}</p>
                            ))
                        ) : (
                            <p>Nessuna domanda recente</p>
                        )}
                    </div>
                    <p className="widgetRedirect">Vai a domande recenti</p>
                </div>
            </div>
        </div>
    )
}

export default MainDashboardView;
