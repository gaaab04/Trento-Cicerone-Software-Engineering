import mongoose from 'mongoose';

// qui si definisce lo schema per la collezione users del database

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true }, //email utente obbligatoria
    password: { type: String, required: true }, //password obbligatoria (viene poi criptata nel controller)
    //il ruolo può essere user, operator o admin, di default, cioè appena uno si registra, viene usato il ruolo user
    // l'admin può modificare il ruolo ed è gestito in adminController
    role: {
        type: String,
        enum: ["user", "operator", "admin"],
        default: "user"
    }
});

// crea il modello, si usa per interagire con il DB
const UserModel = mongoose.model("User", UserSchema);
export default UserModel;