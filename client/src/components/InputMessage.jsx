//Questo componente è per gestire l'input del messaggio che l'utente andrà ad inserire
import React, { useState } from "react";
import ArrowUpIcon from "../assets/arrow-up.svg";
import "../styles/InputMessage.css";

function InputMessage({ onSend }) {
  const [userMessage, setUserMessage] = useState("");

  const handleChange = (e) => setUserMessage(e.target.value);

  const handleSend = () => {
    if (!userMessage.trim()) return;
    onSend(userMessage);
    setUserMessage(""); // pulisce l'input
  };

  return (
    <div className="inputMessage">

      <textarea
        className="chatInput"
        placeholder="Chiedi qualcosa..."
        value={userMessage}
        onChange={handleChange}
        rows={1}  
        maxLength={200} // limite caratteri 
      ></textarea>

      <p className="charCounter">{userMessage.length}/200</p>

      
      <button className="sendButton" onClick={handleSend}>
          <img src={ArrowUpIcon} alt="Invia" />
      </button>
      
    </div>
  );
}

export default InputMessage;
