import request from 'supertest';
import app from '../indexTest.js';

describe('Health check', () => {
    it('GET / should return 200', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.text).toBe('API funzionano...');
    });
});
