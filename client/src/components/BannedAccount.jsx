import "../styles/BannedAccount.css"

// componente che viene mostrato se un utente bannato prova a fare l'accesso
function BannedAccount () {
    return (
        <div className="bannedAccount">
            <div className="appLogo">
                <p className="titoloAppText1">Trento</p>
                <p className="titoloAppText2">Cicerone</p>
            </div>
            <h3>Accesso non consentito :(</h3>
            <p>Il tuo account è temporaneamente sospeso</p>
        </div>
    )
}

export default BannedAccount;