import request from 'supertest';
import app from '../indexTest.js';

test('GET / returns 200', async () => {
    const res = await request(app).get('/');
    expect (res.statusCode).toBe(200);
})