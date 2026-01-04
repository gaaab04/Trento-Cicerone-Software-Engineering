import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../indexTest.js';
import UserModel from '../models/User.js';

describe('Auth routes', () => {
    describe('POST /api/register', () => {
        test('should fail if email is invalid', async () => {
            const res = await request(app)
                .post('/api/register')
                .send({email: 'invalid', password: 'ValidPass1!'});
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Email non valida');
        });
        test('should fail is password is invalid', async () => {
            const res = await request(app)
                .post('/api/register')
                .send({email: 'validMail@gmail.com', password: 'invalid'});
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Password non valida');
        })
        test('should register a new user', async () => {
            const res = await request(app)
                .post('/api/register')
                .send({email: 'validMail@gmail.com', password: 'ValidPass1!'});
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('email', 'validMail@gmail.com');
            expect(res.body).toHaveProperty('role', 'user');
        })
        test('should not allow registration of existing user', async () => {
            await UserModel.create({email: "validMail@gmail.com", password:'hashedpassword'});
            const res = await request(app)
                .post('/api/register')
                .send({email: "validMail@gmail.com", password: 'ValidPass1!'});
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Questa mail è già in uso")
        })
    })
    describe('POST /api/login', () => {
        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash('ValidPass1!', 10);
            await UserModel.create({email: 'validMail@gmail.com', password: hashedPassword})
        })

        test('should fail if user doesnt exist', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({email: "notauser@gmail.com", password: 'ValidPass1!'});
            expect(res.status).toBe(404);
            expect(res.body.login).toBe(false)
            expect(res.body.message).toBe("nessuna corrispondenza trovata");
        })
        test('should fail if password is wrong', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({email: 'validMail@gmail.com', password: 'wrongpassword'});
            expect(res.status).toBe(401);
            expect(res.body.login).toBe(false)
            expect(res.body.message).toBe("la password non corrisponde");
        })
        test('should login with right credentials', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({email: 'validMail@gmail.com', password: "ValidPass1!" });
            expect(res.status).toBe(200);
            expect(res.body.login).toBe(true)
            expect(res.body.message).toBe("Password corretta");
            expect(res.headers['set-cookie']).toEqual(
                expect.arrayContaining([
                    expect.stringMatching(/^accessToken=/),
                    expect.stringMatching(/^refreshToken=/)
                ])
            )
        })
    })
    describe('POST /api/logout', () => {
        test('should clear cookies', async () => {
            const res = await request(app)
                .post('/api/logout')
                .expect(200);
            expect(res.body.message).toBe("Logout effettuato con successo");
            expect(res.headers['set-cookie']).toEqual(
                expect.arrayContaining([
                    expect.stringMatching(/^accessToken=/),
                    expect.stringMatching(/^refreshToken=/)
                ]))
        })
    })
    describe('POST /api/protected', () => {
        test('should deny access without a token', async () => {
            const res = await request(app).get('/api/protected')
            expect(res.status).toBe(401);
            expect(res.body.valid).toBe(false);
            expect(res.body.message).toBe("nessun token di accesso presente");
        })
        test('should allow access with a valid token', async () => {
            const agent = request.agent(app)

            // creo un utente e lo loggo
            const hashedPassword = await bcrypt.hash('ValidPass1!', 10);
            await UserModel.create({email: "validMail@gmail.com", password: hashedPassword})
            await agent
                .post('/api/login')
                .send({email: "validMail@gmail.com", password: "ValidPass1!"});

            const res = await agent.get('/api/protected');
            expect(res.status).toBe(200);
            expect(res.body).toBe("Accesso autorizzato");
        })
    })
    describe('GET /api/refresh', () => {
        test('should fail without refresh token', async () => {
            const res = await request(app).get('/api/refresh')
            expect(res.status).toBe(401);
            expect(res.body.valid).toBe(false);
            expect(res.body.message).toBe("nessun token di rinnovo presente");
        })
        test('should renew access token with valid refresh token', async () => {
            const agent = request.agent(app);

            // creo un utente
            const hashedPassword = await bcrypt.hash('ValidPass1!', 10);
            await UserModel.create({email:'validMail@gmail.com', password: hashedPassword})

            // faccio login
            await agent
                .post('/api/login')
                .send({email: "validMail@gmail.com", password: "ValidPass1!"});

            // refresh
            const res = await agent.get('/api/refresh');
            expect(res.status).toBe(200);
            expect(res.body.valid).toBe(true);
            expect(res.body.message).toBe("token rinnovato");
            expect(res.headers['set-cookie']).toEqual(
                expect.arrayContaining([
                    expect.stringMatching(/^accessToken=/),
                ]))
        })
    })
})

