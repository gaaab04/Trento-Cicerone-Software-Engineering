import React, {useEffect, useState} from "react";
import "../styles/Faqs.css";

function Faqs({setMessage}) {
    // lista di FAQs da mostrare in caso di errori nel caricamento dal database
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
                const response = await fetch('http://localhost:5001/api/faqs', {
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error('Errore nel caricamento delle FAQ');
                }
                const data = await response.json();
                if (data && data.length > 0) {
                    setFaqs(data);
                }
            } catch (error) {
                console.error('Errore nel caricamento delle FAQ:', error.message);
            } finally {
                setLoading(false);
            }
        }
        fetchFaqs();
    }, [])

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
