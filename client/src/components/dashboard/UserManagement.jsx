import "../../styles/dashboard/UserManagement.css"
import SeeMoreIcon from "../../assets/eye-solid.svg"
import BanIcon from "../../assets/minus-circle-solid.svg"
import {useEffect, useState} from "react";
import axios from "axios";
import {API} from "../../api.js";
import {Modal} from "../Modal.jsx";

function UserManagement() {
    // stati generali
    const [suspiciousUsers, setSuspiciousUsers] = useState([]);     // utenti con attività insolita
    const [suspendedUsers, setSuspendedUsers] = useState([]);       // utenti sospesi
    const [userToSuspend, setUserToSuspend] = useState(null);              // id utente selezionato per il ban
    const [userMessages, setUserMessages] = useState([]);           // messaggi di un utente selezionato
    const [emailActionType, setEmailActionType] = useState(null);          // tipo di azione con la mail: susoend o unsuspend
    const [emailInput, setEmailInput] = useState("");               // email su cui fare l'azione di sospensione o riattivazione

    // stati per gestire i modal
    const [confirmSuspendModal, setConfirmSuspendModal] = useState(false);
    const [suspendedUsersModal, setSuspendedUsersModal] = useState(false);
    const [seeUserMessagesModal, setSeeUserMessagesModal] = useState(false);
    const [emailActionModal, setEmailActionModal] = useState(false);

    // funzione che si occupa di recuperare gli utenti sospetti (ossia che hanno inviato un numero >= 10 messaggi nelle ultime 24h)
    const fetchSuspiciousUsers = async () => {
        try {
            const res = await axios.get(`${ API }/api/users/suspicious`, {withCredentials: true});
            setSuspiciousUsers(res.data.users);
        } catch (err) {
            console.error("errore durante il recupero degli utenti sospetti", err);
        }
    }

    useEffect(() => {
        fetchSuspiciousUsers();
    }, [])


    // funzione che si occupa di gestire le azioni via mail in base allo stato emailActionType
    const handleEmailAction = async () => {
        try {
            // ban di un utente
            if (emailActionType === "suspend") {
                await axios.patch(`${ API }/api/users/suspend`, {email: emailInput}, {withCredentials: true});
                alert("Utente sospeso con successo");
            }
            // riattivazione di un utente
            else if (emailActionType === "unsuspend") {
                await axios.patch(`${ API }/api/users/unsuspend`, {email: emailInput}, {withCredentials: true})
                alert("Utente riattivato al servizio con successo");
            }
            // chiusura del modal e reset input
            setEmailActionModal(false);
            setEmailInput("");
            await fetchSuspiciousUsers();
        } catch (err) {
            alert("Operazione non riuscita. Riprova più tardi");
            console.error("Errore: ", err);
        }
    }

    // funzione che si occupa di recuperare gli utenti sospesi
    const handleSuspendedUsers = async () => {
        try {
            // salva il risultato della chiamata api sullo stato suspendedUsers e attiva il modal
            const res = await axios.get(`${ API }/api/users/suspended`, {withCredentials: true});
            setSuspendedUsers(res.data.users);
            setSuspendedUsersModal(true);
        } catch (err) {
            alert("Operazione non riuscita. Riprova più tardi");
            console.error("errore: ", err);
        }
    }

    // funzione che serve per bannare un utente dalla lista degli utenti sospetti
    const handleSuspend = async (userId) => {
        try {
            await axios.patch(`${ API }/api/users/${userId}/suspend`, {}, {withCredentials: true});
            alert("Utente sospeso con successo");
            await fetchSuspiciousUsers();
        } catch (err) {
            alert("Non è stato possibile sospendere l'utente. Riprova più tardi")
            console.error("Errore durante sospensione utente", err);
        }
    }

    // funzione che serve per recuperare e visualizzare gli ultimi messaggi di un utente presente nella lista degli utenti sospetti
    const handleSeeMessages = async (userId) => {
        try {
            const res = await axios.get(`${ API }/api/users/${userId}/messages`, {withCredentials: true});
            setUserMessages(res.data.messages);
            setSeeUserMessagesModal(true);
        } catch (err) {
            alert("Errore durante il recupero degli ultimi messaggi dell'utente");
            console.error("Errore durante recupero messaggi utente", err);
        }
    }


    return (
        <div className="userManagement">
            <h3>Gestione utenti</h3>
            <div className="usersMainWrapper">
                <div className="widgetActionsOnUser">
                    <p className="widgetTitle">Azioni su utente/i</p>
                    <div className="buttonsContainer">
                        <button
                        onClick={() => {
                            setEmailActionType("suspend");
                            setEmailActionModal(true);
                        }}>Sospensione di un account</button>
                        <button onClick={() => {
                            setEmailActionType("unsuspend");
                            setEmailActionModal(true);
                        }}>Riattivazione di un account</button>
                        <button onClick={handleSuspendedUsers}>Vedi lista degli utenti sospesi dal servizio</button>
                    </div>
                </div>
                <div className="widgetSuspiciousUsers">
                    <p className="widgetTitle">Utenti sospetti</p>
                    <p className="widgetSubtitle">Verranno visualizzati gli utenti che hanno eseguito più di 10 domande nelle ultime 24h</p>
                    <div className="suspiciousUsersList">
                        { suspiciousUsers.length > 0  ? (
                            suspiciousUsers.map((user) => (
                                <div key={user.userId} className="susUser">
                                    <p className="susUserMail">{user.email}</p>
                                    <button
                                        className="seeMoreBtn"
                                        onClick={() => {handleSeeMessages(user.userId)}}>
                                            <img src={SeeMoreIcon}/></button>
                                    <button
                                        className ="banBtn"
                                        onClick={() => {
                                            setUserToSuspend(user.userId);
                                            setConfirmSuspendModal(true);
                                        }}>
                                            <img src={BanIcon}/>
                                    </button>
                                </div>
                            ))
                        ) : <p className="noSusUsers">Nessun utente con attività insolita</p>
                        }
                    </div>
                </div>
            </div>

            {/* modal che appare quando si preme il bottone per bannare dalla lista degli utenti sospetti */}
            <Modal shouldShow={confirmSuspendModal} onRequestClose={() => {
                setConfirmSuspendModal(false);
                setUserToSuspend(null);
            }}>
                <h3>Conferma sospensione account</h3>
                <p>Sei sicuro di voler sospendere l'utente selezionato dal servizio?</p>
                <div className="modalButtonsContainer" >
                    <button
                        className="operationConfirmButton"
                        onClick={() => {
                            handleSuspend(userToSuspend);
                            setConfirmSuspendModal(false);
                            setUserToSuspend(null);
                        }}>
                            Conferma
                    </button>
                    <button
                        className="operationCancelButton"
                        onClick={() => {
                            setConfirmSuspendModal(false);
                            setUserToSuspend(null);
                        }}>
                            Annulla
                    </button>
                </div>
            </Modal>

            {/* modal che appare quando si preme il bottone per vedere i messaggi dalla lista degli utenti sospetti */}
            <Modal shouldShow={seeUserMessagesModal} onRequestClose={() => {
                setSeeUserMessagesModal(false);
                setUserMessages([]);
            }}>
                <h3>Lista messaggi utente delle ultime 24 ore</h3>
                <div className="modalScrollableWrapper">
                    {userMessages.length > 0 ? (
                        userMessages.map((userMessage) => (
                            <div key={userMessage._id} className={"userMessageContainer"}>
                                <p>{userMessage.content}</p>
                                <p className="timeOfMessage">{new Date(userMessage.createdAt).toLocaleString('it-IT', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                })}</p>
                            </div>
                        ))) : <p>Nessun messaggio</p>
                    }
                </div>
            </Modal>

            {/* modal che appare quando si preme su "sospensione di un account" oppure "riattivazione di un account */}
            <Modal shouldShow={emailActionModal} onRequestClose={() => {
                setEmailActionModal(false);
                setEmailInput("");
            }}>
                <h3>
                    {emailActionType === "suspend"
                    ? "Sospendi un account"
                    : "Riattiva un account"}
                </h3>

                <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={"Inserisci la mail dell'utente"}
                    className="emailInput"
                />

                <div className="modalButtonsContainer">
                    <button className="operationConfirmButton" onClick={handleEmailAction}>
                        Conferma
                    </button>
                    <button className="operationCancelButton" onClick={() =>{
                        setEmailActionModal(false);
                        setEmailInput("");
                    }}>Annulla</button>
                </div>
            </Modal>

            {/* modal che appare quando su preme su "vedi lista degli utenti sospesi" */}
            <Modal shouldShow={suspendedUsersModal} onRequestClose={() => {
                setSuspendedUsersModal(false);
                setSuspendedUsers([]);
            }}>
                <h3>Lista degli utenti sospesi</h3>
                <div className="modalScrollableWrapper">
                    {suspendedUsers.length > 0 ? (
                        suspendedUsers.map((suspendedUser) => (
                            <p key={suspendedUser._id}>{suspendedUser.email}</p>
                        ))
                    ): <p>Nessun utente sospeso attualmente</p>
                    }
                </div>
            </Modal>
        </div>
    )
}

export default UserManagement;