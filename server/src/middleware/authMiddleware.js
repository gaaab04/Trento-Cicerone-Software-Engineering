import jwt from 'jsonwebtoken';
import UserModel from "../models/User.js";

// middleware per la verifica che l'utente sia autenticato
export const verifyUser = async (req, res, next) => {
    //prende il token dal cookie
    const accessToken = req.cookies.accessToken;
    //se non esiste, ritorna un errore 401
    if (!accessToken) {
        return res.status(401).json({ valid: false, message: "nessun token di accesso presente" });
    }

    try {
        //decodifica e verifica il token usando la chiave
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

        // trova utente
        const user = await UserModel.findById(decoded.userId);

        // se l'utente non viene trovato ritorna messaggio di errore
        if (!user) {
            return res.status(401).json({valid: false, message:"utente non trovato"})
        }

        // se l'utente è sospeso torna messaggio di errore
        if (user.suspended) {
            return res.status(403).json({ valid: false, message: "L'account è sospeso" });
        }
        //aggiunge le info utili all'oggetto req per poterli usare dopo
        req.userId = decoded.userId;
        req.email = decoded.email;
        req.role = decoded.role;

        //passa a middleware o route successiva
        next();
    } catch (err) {
        // se il token non è valdido oppure è scaduto, ritorna un errore 401
        return res.status(401).json({ valid: false, message: "token non valido o scaduto" });
    }
};

 // middleware per rinnovare il token usando il refresh
export const renewToken = (req, res) => {
    //prende il token dal cookie
    const refreshToken = req.cookies.refreshToken;

    // se non c'è refreshToken, blocco richiesta
    if (!refreshToken) return res.status(401).json({ valid: false, message: "nessun token di rinnovo presente" });

    // verifico che il refreshToken sia valido
    jwt.verify(refreshToken, process.env.JWT_REFRESH, (err, decoded) => {
        if (err) return res.status(401).json({ valid: false, message: "token di rinnovo non valido" });

        // se valido genero un nuovo token di accesso e lo invio nel cookie
        const newAccessToken = jwt.sign({userId: decoded.userId, email: decoded.email, role:decoded.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("accessToken", newAccessToken, { maxAge: 3600000, httpOnly: true, secure: false, sameSite: 'lax' });

        // ritorna messaggio di successo
        return res.json({ valid: true, message: "token rinnovato" });
    });
};
