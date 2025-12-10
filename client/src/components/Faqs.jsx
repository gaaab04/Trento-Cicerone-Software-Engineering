import React, {useEffect, useState} from "react";
import "../styles/Faqs.css";
import {API} from "../api.js";
import axios from "axios";

function Faqs({setMessage}) {
    // lista di faqs da mostrare in caso di errori con la chiamata al server
    const defaultFaqs = [
        "Come funziona la raccolta differenziata a Trento?",
        "Qual è il numero dell'ufficio del Comune?",
        "Come richiedo un permesso ZTL?"
    ]

    const [faqs, setFaqs] = React.useState(defaultFaqs);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await axios.get(`${ API }/api/faqs`, {withCredentials: true});

                // aggiorna lo stato solo se il server ha restituito i dati richiestu
                if (response.data && response.data.length > 0) {
                    setFaqs(response.data);
                }
            } catch (error) {
                console.error('Errore nel caricamento delle FAQ:', error.message);
            } finally {
                setLoading(false);
            }
        }
        fetchFaqs();
    }, [])

    // se le faqs si stanno caricando viene mostrato questo messaggio
    if (loading) return <div className="faqsContent">Caricamento FAQ in corso...</div>;

    return (
        <div className="faqsContent">
            <div className="mainTitle">Cosa vuoi sapere su Trento?</div>
            <div className="introFaqs">
                <p>Spesso mi viene chiesto:</p>
                <ul>
                    {faqs.map((faq, index) => (
                        <li key={faq._id || index} onClick={()=> setMessage(faq.question || faq)}>
                            {faq.question || faq}
                            </li>
                    ))}
                </ul>
            </div>


            <div className="privacyWarning">Per proteggere la tua privacy, evita di condividere informazioni personali o sensibili. <br/>
            Il servizio è pensato solo per fornire informazioni generali su Trento e i suoi servizi.
            </div>
        </div>
    );
}

export default Faqs;
