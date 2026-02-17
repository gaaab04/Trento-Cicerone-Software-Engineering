# Trento Cicerone - Progetto Software Engineering
### Introduzione al progetto
Questo repository contiene il codice del progetto Trento Cicerone. Si tratta di una web app sviluppata come assistente virtuale per la città di Trento. L'obiettivo principale è fornire agli utenti informazioni su turismo, storia, eventi e servizi comunali attraverso un'interfaccia di chat.

Il sistema utilizza un approccio RAG (Retrieval-Augmented Generation) per garantire che le risposte fornite dall'intelligenza artificiale siano basate su documenti reali e verificati inseriti dagli operatori del servizio, riducendo il rischio di informazioni errate e/o allucinazioni.

### Struttura del progetto
Il progetto è suddiviso in due cartelle:
- **client**: contiene il frontend sviluppato in React (Vite)
- **server**: contiene il backend sviluppato in Node.js ed Express, che gestisce le API, il database e l'integrazione con l'api di Gemini

### Stack utilizzato
- **Frontend**: React, Vite, CSS
- **Backend**: Node.js Express
- **Database**: MongoDB (con Mongoose).
- **AI & Embeddings**: Google Gemini API (`gemini-2.5-flash-lite` + `gemini-embedding-001`)
- **Autenticazione**: JWT (Access Token e Refresh Token) salvati in cookie HTTP
- **Testing**: Jest e Supertest per i test di integrazione del backend.

### Installazione e avvio
Per eseguire il progetto in locale è necessario configurare sia il lato server che il lato client.

#### Prerequisiti
- Node.js
- Un cluster MongoDB (locale o cloud)
- Una chiave API di Google Gemini

#### Configurazione Backend
1. Spostarsi nella cartella `server`:

```bash
cd server
```

2. Installare le dipendenze

```bash
npm install
```

3. Creare un file `.env` nella cartella `server` seguendo il contenuto di `.env.example`e inserendo i propri dati

4. Avviare il server

```bash
npm start
```

#### Configurazione Frontend
1. Spostarsi nella cartella `client`:

```bash
cd client
```

2. Installare le dipendenze

```bash
npm install
```

3. Creare un file `.env` nella cartella `client` seguendo il contenuto di `.env.example`e inserendo i propri dati

4. Avviare l'applicazione

```bash
npm run dev
```

L'interfaccia sarà visitabile all'indirizzo indicaot nel terminale (solitamente `http://localhost:5173`).


#### Testing
Il progetto include un ambiente di test per il backend. Per eseguire i test:
1. Assicurarsi di essere nella cartella `server`
2. Lanciare il comando

```bash
npm test
```

I test utilizzano `mongodb-memory-server` per non intaccare il database reale durante le esecuzioni