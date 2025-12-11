import "../../styles/dashboard/MainDashboardView.css"
import {useEffect, useState} from "react";
import axios from "axios";
import {API} from "../../api.js";
import {Modal} from "../Modal.jsx";

function MainDashboardView() {
    // stato per statistiche feedback
    const [feedbackStats, setFeedbackStats] = useState({
        positive: 0,
        negative: 0,
        total: 0
    });
    const [lastQuestions, setLastQuestions] = useState(null); // stato per le domande recenti
    const [serviceEnabled, setServiceEnabled] = useState(false); // stato per lo stato del servizio (attivo o disattivo)
    const [showServiceModal, setShowServiceModal] = useState(false); // stato che gestisce l'apparizione del modal di conferma per cambiare stato del servizio

    // recupera lo stato del servizio (attivo o disattivo)
    const fetchServiceStatus = async () => {
        try {
            const res = await axios.get(`${API}/api/services/status`, {withCredentials: true});
            setServiceEnabled(res.data.serviceStatus.enabled);
            console.log(res.data.serviceStatus.enabled);
        } catch (error) {
            console.error("Errore nell'ottenere lo stato servizio", error);
        }
    }

    // gestione attivazione / disattivazione del servizio (in pratica le domande non vengono inviate all'api)
    const handleChangeServiceStatus = async (serviceStatus) => {
        try {
            // caso in cui il servizio è attivo, quindi in questo caso si disattiva
            if (serviceStatus) {
                await axios.post(`${API}/api/services/disable`, {}, {withCredentials: true});
                alert("Hai disattivato il servizio");
            }

            // caso in cui il servizio è disattivo, quindi si riattiva
            else {
                await axios.post(`${API}/api/services/enable`, {}, {withCredentials: true});
                alert("Hai riattivato il servizio");
            }

            // chiusura del modal e aggiornamento dello status
            setShowServiceModal(false);
            fetchServiceStatus();
        } catch (error) {
            console.error("Errore nel cambiare lo stato", error);
            alert("Non è stato possibile eseguire l'operazione. Riprova più tardi");
        }
    }

    // recupero delle statistiche dei feedback nelle ultime 24 ore
    const fetchFeedbackStats = async () => {
        try {
            const res = await axios.get(`${API}/api/dashboard/feedback/stats`, { withCredentials: true });
            setFeedbackStats(res.data);
        } catch (error) {
            console.error('Errore durante il recupero dei dati di feedback:', error);
        }
    }

    // recupero delle ultime 4 domande poste dagli utenti (si può modificare il limite cambiando limit alla fine)
    const fetchLastQuestions = async () => {
        try {
            const res = await axios.get(`${API}/api/dashboard/last-questions?limit=4`, { withCredentials: true });
            setLastQuestions(res.data);
        } catch (error) {
            console.error('Errore durante il recupero delle domande recenti:', error);
            throw new Error ('Errore durante il recupero delle domande recenti:');
        }
    }

    // funzioni chiamate al caricamento della pagina
    useEffect(() => {
        fetchFeedbackStats();
        fetchLastQuestions();
        fetchServiceStatus();
    }, []);


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
                    {serviceEnabled ? (
                        <p className="widgetActiveState">Attivo</p>
                    ) : <p className="widgetDisabledState">Disattivo</p>}
                    {serviceEnabled ? (
                        <p onClick={()=> setShowServiceModal(true)}>Disattiva il servizio</p>
                    ) : <p onClick={() => setShowServiceModal(true)}>Riattiva il servizio</p>}
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

            {/* modal che appare quando si vuole attivare / disattivare il servizio */}
            <Modal shouldShow={showServiceModal} onRequestClose={()=> {
                setShowServiceModal(false);
            }}>
                {serviceEnabled ? (
                    <h3>Sei sicuro di voler disattivare il servizio?</h3>
                ) : <h3>Riattivare il servizio?</h3>}
                <div className="modalButtonsContainer">
                    <button
                        className="operationConfirmButton"
                        onClick={() => handleChangeServiceStatus(serviceEnabled)}>Conferma</button>
                    <button
                        className="operationCancelButton"
                        onClick={() => {setShowServiceModal(false);}}>Annulla</button>
                </div>
            </Modal>
        </div>
    )
}

export default MainDashboardView;
