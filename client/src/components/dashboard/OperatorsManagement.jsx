import {useEffect, useState} from "react";
import "../../styles/dashboard/OperatorsManagement.css"
import axios from "axios";
import {API} from "../../api.js";
import {useNavigate} from "react-router-dom";

function OperatorsManagement () {
    const navigate = useNavigate();
    const [operators, setOperators] = useState([]);          // lista operatori / admin attivi
    const [emailInput, setEmailInput] = useState("");       // input dell'email da promuovere / declassare

    // verifica che solo gli admin possano accedere a questa pagina
    const checkAccess = async () => {
        try {
            // ottengo il ruolo dell'utente
            const res = await axios.get(`${ API }/api/users/me`, {withCredentials: true});
            const userRole = res.data.role;

            // controllo se l'utente è admin
            if (userRole !== 'admin') {
                navigate("/");
                alert("Non sei autorizzato ad accedere a questa pagina");
            }
        } catch (error) {
            console.error("errore durante verifica accesso:", error);
            if (error.response.status === 401) {
                navigate("/login");
                alert("Non sei autorizzato. Effettua il login");
            } else {
                alert("Errore durante la verifica dei permessi");
                navigate("/");
            }
        }
    }

    // recupera la ista degli operatori e admin attivi
    const fetchCurrentOperators = async () => {
        try {
            const res = await axios.get(`${API}/api/admin/operators`, {withCredentials: true});
            setOperators(res.data.activeOperators);
        } catch (err) {
            console.log("Errore durante recupero operatori", err);
        }
    }

    // funzioni chiamate al caricamento iniziale
    useEffect(() => {
        checkAccess();
        fetchCurrentOperators();
    }, []);

    // promozione o rimozione di un operatore
    const handleEmailAction = async (action) => {
        try {
            if (action === 'promote') {
                await axios.patch(`${ API }/api/admin/promote`, {email: emailInput}, {withCredentials: true});
                alert("Utente promosso con successo");
            }
            else if (action === 'demote') {
                await axios.patch(`${ API }/api/admin/demote`, {email: emailInput}, {withCredentials: true});
                alert("Utente rimosso dal ruolo di operatore con successo");
            }

            // pulisco campo input e refresho la lista
            setEmailInput("");
            fetchCurrentOperators();
        } catch (error) {
            alert("Operazione non riuscita. Riprova più tardi");
            console.error("Errore: ", error);
        }
    }

    return (
        <div className="operatorsManagement">
            <h3>Gestione operatori</h3>
            <div className="operatorsMainWrapper">
                <div className="promoteOrDemoteSection">
                    <p className="widgetTitle">Promuovi o rimuovi un utente dal ruolo di operatore</p>
                    <div className="promoteOrDemote">
                        <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="Email dell'utente o dell'operatore "/>
                        <div className="promoteOrDemoteButtons">
                            <button onClick={() => {handleEmailAction("promote");}}>Promuovi ad operatore</button>
                            <button onClick={() => handleEmailAction("demote")} >Rimuovi da operatore</button>
                        </div>
                    </div>
                </div>
                <div className="activeOperatorsAndAdmins">
                    <p className="widgetTitle">Lista di operatori e admin attualmente attivi</p>
                    <div className="operatorsAdminsList">
                        {operators.length > 0 ? (
                            operators.map((operator) => (
                                <div key={operator._id} className="operatorOrAdminEntity">
                                    <p className="userMail">{operator.email}</p>
                                    <p className="userRole">{operator.role}</p>
                                </div>
                            ))
                        ) : <p>Nessun operatore attualmente attivo</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OperatorsManagement;