import {jest} from '@jest/globals'
import request from 'supertest';
import app from '../indexTest.js';
import UserModel from '../models/user.js';
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
})