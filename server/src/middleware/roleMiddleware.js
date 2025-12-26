
export const permit = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            // verifyUser è già stato eseguito
            if (!req.role) {
                return res.status(403).json({message: "ruolo non trovato"});
            }
            //verifica se il ruolo dell'utente è tra quelli che hanno il permesso
            if (!allowedRoles.includes(req.role)) {
                return res.status(403).json({message: "accesso negato"});
            }
            // questo è il caso in cui tutto è andato bene
            next();
        } catch (err) {
            return res.status(500).json({message: "errore del server"});
        }
    }
}
