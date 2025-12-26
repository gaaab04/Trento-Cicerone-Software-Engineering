import UserModel from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// check lato backend della validità della mail
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// check lato backend della validità della password
const isValidPassword = (password) => {
    const errors = [];
    if (!password || password.length < 8) errors.push("La password deve essere lunga almeno 8 caratteri");
    if (password.length > 16) errors.push("La password non può superare i 16 caratteri");
    if (!/[a-z]/.test(password)) errors.push("La password deve contenere almeno una lettera minuscola");
    if (!/[A-Z]/.test(password)) errors.push("La password deve contenere almeno una lettera maiuscola");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("La passwod deve contenere almeno un carattere speciale");
    if (errors.length > 0) return false;
    else return true;
}

// registra un nuovo utente
export const registerUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        // se i campi email e password non sono presenti, restituisce un errore
        if (!email || !password) {
            return res.status(400).json({message: "Email e password sono obbligatori"});
        }

        // se la mail non è valida, restituisce un errore
        if (!isValidEmail(email)) {
            console.error("Email non valida:", email);
            return res.status(400).json({message: "Email non valida"});
        }

        // se la passwors non è valida, restituisce un errore
        if (!isValidPassword(password)) {
            console.error("Password non valida:", password);
            return res.status(400).json({message: "Password non valida"});
        }

        // controlla se l'email è già registrata
        const existingUser = await UserModel.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: "Questa mail è già in uso"});
        }

        // cripta la password con bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // crea un nuovo utente con la password criptata
        const user = await UserModel.create({email, password: hashedPassword});

        const userResponse = {
            email: user.email,
            role: user.role
        };

        res.status(201).json(userResponse);

    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ login:false,  message: "nessuna corrispondenza trovata" });
        }

        // confronta la password criptata nel database con quella inserita nel form
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // se la password non corrisponde, restituisce un errore
        if (!isPasswordValid) {
            return res.status(400).json({ login:false, message: "la password non corrisponde" });
        }

        // token di accesso
        const accessToken = jwt.sign({userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            {expiresIn: "1h"});

        // token di rinnovo
        const refreshToken = jwt.sign({userId: user._id, email: user.email, role:user.role},
            process.env.JWT_REFRESH,
            {expiresIn: "7d"});

        // dopo aver generato i token, li invia nel cookie
        res.cookie("accessToken", accessToken, {maxAge: 3600000, httpOnly: true, secure: false, sameSite: 'lax'}); //TODO una volta che siamo in HTTPS, cambiare secure a true e sameSite a 'strict'
        res.cookie("refreshToken", refreshToken, {maxAge: (3600000*7*24), httpOnly: true, secure: false, sameSite: 'lax'}); //TODO forse refreshToken va salvato nel DB

        // restituisce un messaggio di successo
        return res.json({ login:true, message: "Password corretta", role:user.role});

    } catch (error) {
        return res.json({login:false, error: error.message });
    }
};

// funzione per effettuare il logout dell'utente
export const logoutUser = (req, res) => {
    // prima rimuove i cookie dal browser
    res.clearCookie("accessToken", {httpOnly: true, secure: false, sameSite: 'lax'}); //TODO vanno cambiati quando si va ad https
    res.clearCookie("refreshToken", {httpOnly: true, secure: false, sameSite: 'lax'});

    // invia messaggio di successo
    return res.status(200).json({message: "Logout effettuato con successo"});
}