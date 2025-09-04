import express from 'express';
import route from './route.js';
import cors from 'cors';
const app = express();
const PORT = 5000;

// Custom logging middleware
app.use((req, res, next) => {
    const now = new Date().toISOString();
    console.log(`[${now}] ${req.method} ${req.originalUrl}`);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send("Welcome to URL Shortener Service");
});
app.use(cors({
    origin: '*',
}));
app.use('/shorten', route);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
