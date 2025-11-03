import express from 'express';
import connectDB from './db.js'; // Importing the connectDB function

const app = express();

// Connect to MongoDB
connectDB();

// Middleware & routes
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));