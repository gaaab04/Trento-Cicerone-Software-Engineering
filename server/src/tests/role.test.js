import {jest} from '@jest/globals';
import request from 'supertest';
import app from '../indexTest.js';
import UserModel from '../models/User.js';
import bcrypt from 'bcrypt';


describe('Role routes', () => {
    const validMail = "validMail@gmail.com";
    const validPassword = "ValidPass1!";
    const agent = request.agent(app)

    // funzione per creare e loggare utenti
    async function createUserAndLogin(email, role) {
        const hashedPassword = await bcrypt.hash(validPassword, 10);
        await UserModel.create({email: email, password: hashedPassword, role: role})
        await agent
            .post('/api/login')
            .send({email: email, password: validPassword});
    }

    describe('GET /api/access/public', () => {
        test("user should access public routes", async () => {
            await createUserAndLogin(validMail, "user");
            const res = await agent.get('/api/access/public')
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Accesso consentito a chiunque");
            expect(res.body.role).toBe("user");
        })
        test("operator should access public routes", async () => {
            await createUserAndLogin(validMail, "operator");
            const res = await agent.get('/api/access/public')
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Accesso consentito a chiunque");
            expect(res.body.role).toBe("operator");
        })
        test("admin should access public routes", async () => {
            await createUserAndLogin(validMail, "admin");
            const res = await agent.get('/api/access/public')
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Accesso consentito a chiunque");
            expect(res.body.role).toBe("admin");
        })
    })
    describe('GET /api/access/operator', () => {
        test("user should not access operator routes", async () => {
            await createUserAndLogin(validMail, "user");
            const res = await agent.get('/api/access/operator')
            expect(res.status).toBe(403);
            expect(res.body.message).toBe("accesso negato");
        })
        test("operator should access operator routes", async () => {
            await createUserAndLogin(validMail, "operator");
            const res = await agent.get('/api/access/operator')
            expect(res.status).toBe(200);
            expect(res.body.role).toBe("operator");
        })
        test("admin should access operator routes", async () => {
            await createUserAndLogin(validMail, "admin");
            const res = await agent.get('/api/access/operator')
            expect(res.status).toBe(200);
            expect(res.body.role).toBe("admin");
        })
    })
    describe('GET /api/access/admin', () => {
        test("user should not access admin routes", async () => {
            await createUserAndLogin(validMail, "user");
            const res = await agent.get('/api/access/admin')
            expect(res.status).toBe(403);
            expect(res.body.message).toBe("accesso negato");
        })
        test("operator should not access admin routes", async () => {
            await createUserAndLogin(validMail, "operator");
            const res = await agent.get('/api/access/admin')
            expect(res.status).toBe(403);
            expect(res.body.message).toBe("accesso negato");
        })
        test("admin should access admin routes", async () => {
            await createUserAndLogin(validMail, "admin");
            const res = await agent.get('/api/access/admin')
            expect(res.status).toBe(200);
            expect(res.body.role).toBe("admin");
        })
    })
})