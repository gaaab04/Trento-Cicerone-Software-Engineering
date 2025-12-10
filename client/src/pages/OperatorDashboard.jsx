import Sidebar from "../components/dashboard/Sidebar.jsx";
import "../styles/dashboard/OperatorDashboard.css"
import MainDashboardView from "../components/dashboard/MainDashboardView.jsx";
import FaqsManagement from "../components/dashboard/FaqsManagement.jsx";
import RecentQuestions from "../components/dashboard/RecentQuestions.jsx";
import DocumentManagement from "../components/dashboard/DocumentManagement.jsx";
import FeedbackRevision from "../components/dashboard/FeedbackRevision.jsx";
import UserManagement from "../components/dashboard/UserManagement.jsx";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {API} from "../api.js";
import OperatorsManagement from "../components/dashboard/OperatorsManagement.jsx";

function OperatorDashboard() {
    const [activeView, setActiveView] = useState('dashboard');
    const navigate = useNavigate();

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const res = await axios.get(`${ API }/api/users/me`, {withCredentials: true});
                const userRole = res.data.role;

                // controllo se l'utente è operatore o admin
                if (userRole !== 'operator' && userRole !== 'admin') {
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
        }; checkAccess();
    }, [navigate])

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <MainDashboardView />;
            case 'documenti': return <DocumentManagement/>;
            case 'faq': return <FaqsManagement />;
            case 'feedback': return <FeedbackRevision/>;
            case 'utenti': return <UserManagement/>;
            case 'domande': return <RecentQuestions/>;
            case 'admin': return <OperatorsManagement/>;
            default: return <MainDashboardView />;
        }
    };

    return (
        <div className="operatorDashboard">
            <Sidebar activeView = {activeView} setActiveView = {setActiveView} />

            <div className={`operatorDashboardContent ${activeView === "documenti" || activeView === "feedback" || activeView === "utenti" || activeView === "admin" ? "scrollable" : ""}`}>
                {renderContent()}
            </div>
        </div>
    )
}

export default OperatorDashboard;