export const getPublic = async (req, res) => {
    try {
        return res.json({
            message: "Accesso consentito a chiunque",
            user: req.email,
            role: req.role
        })
    } catch (error) {
        return res.json({message: "Errore del server"})
    }
}

export const getOperator = async (req, res) => {
    try {
        return res.json({
            message: "Accesso consento a operatori e admin",
            user: req.email,
            role: req.role
            }
        )
    } catch (error) {
        return res.json({message: "Errore del server"})
    }
}

export const getAdmin = async (req, res) => {
    try {
        return res.json({
            message: "Accesso consentito solo a admin",
            user: req.email,
            role: req.role
        })
    } catch (error) {
        return res.json({message: "Errore del server",})
    }
}
