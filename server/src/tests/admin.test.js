import {jest} from '@jest/globals'
import request from 'supertest';
import app from '../indexTest.js';
import UserModel from '../models/User.js';
import bcrypt from "bcrypt";
import mongoose from "mongoose";

describe('Admin routes', () => {
    const validMail = "validMail@gmail.com";
    const validPassword = "ValidPass1!";

    describe('GET /api/admin/operators', () => {
        const agent = request.agent(app)
        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash(validPassword, 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "admin"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: "ValidPass1!"});
        })
        test("should get all operators", async () => {
            // creo due utente con ruolo operatore e siccome la funzione restituisce sia operatori che admin dovrebbe restituire 3 utenti
            await UserModel.create({email: "operator1@gmail.com", password: "Password123!", role: "operator"})
            await UserModel.create({email: "operator2@gmail.com", password: "12validPword!", role: "operator"})
            const res = await agent.get('/api/admin/operators')
            expect(res.status).toBe(200);
            expect(res.body.activeOperators).toHaveLength(3);
            expect(res.body.activeOperators.every(operator => operator.role === "operator" || operator.role === "admin")).toBe(true);
        })
        test("should return the only admin if there are no operators", async () => {
            const res = await agent.get('/api/admin/operators')
            expect(res.status).toBe(200);
            expect(res.body.activeOperators).toHaveLength(1);
            expect(res.body.activeOperators[0].role).toBe("admin");
            expect(res.body.activeOperators[0].email).toBe(validMail);
        })
        test("should fail if user is not admin", async () => {
            await UserModel.findOneAndDelete({email: validMail});
            const hashedPassword = await bcrypt.hash(validPassword, 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "operator"})
            const agent1 = request.agent(app)
            await agent1
                .post('/api/login')
                .send({email: validMail, password: validPassword});
            const res = await agent1.get('/api/admin/operators')
            expect(res.status).toBe(403);
            expect(res.body.message).toBe("accesso negato");
        })
    })
    describe('PATCH /api/admin/promote/', () => {
        const agent = request.agent(app)
        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash(validPassword, 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "admin"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: "ValidPass1!"});
        })
        test("should promote an user to operator", async () => {
            await UserModel.create({email: "user@gmail.com", password: "Password123!", role: "user"})
            const res = await agent
                .patch('/api/admin/promote/')
                .send({email: "user@gmail.com"})
            expect(res.status).toBe(200)
            expect(res.body.message).toBe("Utente promosso a operatore")
            const operator = await UserModel.findOne({email: "user@gmail.com"});
            expect(operator.role).toBe("operator");
        })
        test("should fail due to non existing user", async () => {
            const res = await agent
                .patch("/api/admin/promote/")
                .send({email: "nonExisting@gmail.com"})
            expect(res.status).toBe(404)
            expect(res.body.message).toBe("Utente non trovato")
        })
        test("should fail if user is already operator", async () => {
            await UserModel.create({email:"operator@gmail.com", password: "Password123!", role: "operator"})
            const res = await agent
                .patch("/api/admin/promote/")
                .send({email: "operator@gmail.com"})
            expect(res.status).toBe(400)
            expect(res.body.message).toBe("Non è possibile promuovere un operatore o un admin")
        })
    })
    describe('PATCH /api/admin/demote/', () => {
        const agent = request.agent(app)
        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash(validPassword, 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "admin"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: "ValidPass1!"});
        })
        test("should demote an operator to user", async () => {
            await UserModel.create({email: "toDemote@gmail.com", password: "Password123!", role: "operator"})
            const res = await agent
                .patch("/api/admin/demote/")
                .send({email: "toDemote@gmail.com"})
            expect(res.status).toBe(200)
            expect(res.body.message).toBe("Ruolo di operatore rimosso")
            const user = await UserModel.findOne({email: "toDemote@gmail.com"})
            expect(user.role).toBe("user");
        })
        test("should fail if user is not operator", async () => {
            await UserModel.create({email: "user@gmail.com", password: "Password123!", role: "user"})
            const res = await agent
                .patch("/api/admin/demote/")
                .send({email: "user@gmail.com"})
            expect(res.status).toBe(401)
            expect(res.body.message).toBe("Non è possibile togliere il ruolo di operatore da un utente normale")
        })
        test("should fail if user is an admin", async () => {
            await UserModel.create({email: "admin@gmail.com", password: "Password123!", role: "admin"})
            const res = await agent
                .patch("/api/admin/demote/")
                .send({email: "admin@gmail.com"})
            const admin = await UserModel.findOne({email: "admin@gmail.com"})
            expect(res.status).toBe(401)
            expect(res.body.message).toBe("Non è possibile togliere il ruolo di operatore ad un admin")
            expect(admin.role).toBe("admin");
        })
        test("should fail due to inexistent user", async () => {
            const res = await agent
                .patch("/api/admin/demote/")
                .send({email: "idontexist@gmail.com"})
            expect(res.status).toBe(404)
            expect(res.body.message).toBe("Utente non trovato")
        })
    })
})