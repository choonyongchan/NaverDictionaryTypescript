import express from 'express';
const {Request, Response, NextFunction} = express; // CommonJS style import

import { NaverAPI } from '../scraper/api.ts'; // Adjust the import path as needed


const app = express();
const PORT = process.env.PORT || 8080;

// Middleware for parsing JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ status: 'Welcome to the Naver Scraper API!' });
});

// Get word data
app.get('/get', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const word = req.query.word as string;
        if (!word) {
            return res.status(400).json({ error: 'Word parameter is required' });
        }
        
        const result = await NaverAPI.get(word);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get entry info
app.get('/get/entryinfo', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const word = req.query.word as string;
        if (!word) {
            return res.status(400).json({ error: 'Word parameter is required' });
        }
        
        const result = await NaverAPI.getEntryInfoRaw(word);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get search info
app.get('/get/searchinfo', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const word = req.query.word as string;
        if (!word) {
            return res.status(400).json({ error: 'Word parameter is required' });
        }
        
        const result = await NaverAPI.getSearchInfoRaw(word);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get message
app.get('/get/message', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const word = req.query.word as string;
        if (!word) {
            return res.status(400).json({ error: 'Word parameter is required' });
        }
        
        const result = await NaverAPI.getMessage(word);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

export function startServer() {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}