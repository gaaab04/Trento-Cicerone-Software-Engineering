import React from "react";
import "../styles/Faqs.css";

function Faqs({setMessage}) {
    const faqs = [
        "Come funziona la raccolta differenziata a Trento?",
        "Qual è il numero dell'ufficio del Comune?",
        "Come richiedo un permesso ZTL?"
    ]

    return (
        <div className="faqsContent">
            <div className="mainTitle">Cosa vuoi sapere su Trento?</div>
            <div className="introFaqs">
                <p>Spesso mi viene chiesto:</p>
                <ul>
                    {faqs.map((faq, index) => (
                        <li key={index} onClick={()=> setMessage(faq)}>
                            {faq}
                            </li>
                    ))}
                </ul>
            </div>


            <div className="privacyWarning">Per proteggere la tua privacy, evita di condividere informazioni personali o sensibili. <br/>
            Il servizio è pensato solo per ofrnire informazioni generali su Trento e i suoi servizi.
            </div>
        </div>
    );
}

export default Faqs;
