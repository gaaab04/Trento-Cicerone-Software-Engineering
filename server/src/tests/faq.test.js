import {jest} from '@jest/globals'
import request from 'supertest';
import app from '../indexTest.js';
import UserModel from "../models/User.js";
import FaqModel from "../models/Faq.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

describe('FAQ routes', () => {
    const validMail = "validMail@gmail.com";
    const validPassword = "ValidPass1!";
    describe('GET /api/faqs', () => {
        const agent = request.agent(app)
        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash(validPassword, 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "user"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: "ValidPass1!"});
        })
        test("should return all faqs", async () => {
            await FaqModel.create({question: "question1"})
            await FaqModel.create({question: "question2"})
            const res = await agent.get('/api/faqs')
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].question).toBe("question1");
            expect(res.body[1].question).toBe("question2");
        })
        test("should return empty array if there are no faqs", async () => {
            const res = await agent.get('/api/faqs')
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(0);
        })
    })
    describe('GET /api/faqs/categories', () => {
        test("should return all categories", async () => {
            const agent = request.agent(app)
            const hashedPassword = await bcrypt.hash(validPassword, 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "operator"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: "ValidPass1!"});
            await FaqModel.create({question: "question1"})
            const res = await agent.get('/api/faqs/categories')
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(8);
            expect(res.body[0]).toBe("Trasporti");
        })
    })
    describe('POST /api/faqs', () => {
        const agent = request.agent(app)
        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash(validPassword, 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "operator"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: "ValidPass1!"});
        })
        test("should create a new faq", async () => {
            const res = await agent
                .post('/api/faqs')
                .send({question: "question1", category: "Trasporti"});
            const faq = await FaqModel.findOne({question: "question1"});
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('question', 'question1');
            expect(faq).toBeDefined();
        })
        test("should create a new faq (with category = Generale) if category is empty", async () => {
            const res = await agent
                .post('/api/faqs')
                .send({question: "question1"});
            const faq = await FaqModel.findOne({question: "question1"});
            expect(res.status).toBe(201);
            expect(faq).toBeDefined();
            expect(faq.category).toBe("Generale");
        })
        test("should fail if question is empty", async () => {
            const res = await agent
                .post('/api/faqs')
                .send({category: "Trasporti"});
            expect(res.status).toBe(500);
        })
        test("should fail if question is longer than 200 characters", async () => {
            // stringa di 201 caratteri
            const longQuestion = "a".repeat(201);
            const res = await agent
                .post('/api/faqs')
                .send({question: longQuestion, category: "Trasporti"});
            expect(res.status).toBe(401);
            expect(res.body.message).toBe("Impossibile creare la FAQ. Superato limite 200 caratteri della domanda.");
        })
        test("should fail if category is not valid", async () => {
            const res = await agent
                .post('/api/faqs')
                .send({question: "question1", category: "invalid"});
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Impossibile creare la FAQ. Verifica che il campo category sia valido.");
        })
    })
    describe("PUT /api/faqs/:id", () => {
        const agent = request.agent(app)
        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash(validPassword, 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "operator"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: "ValidPass1!"});
            await FaqModel.create({question: "QuestionToUpdate", category: "Generale"});
        })

        test("should update a faq", async () => {
            const faq = await FaqModel.findOne({question: "QuestionToUpdate"});
            const id = faq._id;
            const res = await agent
                .put(`/api/faqs/${id}`)
                .send({question: "NewQuestion", category: "Trasporti"});
            expect(res.status).toBe(200);
            expect(res.body.question).toBe("NewQuestion");
            expect(res.body.category).toBe("Trasporti");
        })
        test("should update only category", async () => {
            const faq = await FaqModel.findOne({question: "QuestionToUpdate"});
            const id = faq._id;
            const res = await agent
                .put(`/api/faqs/${id}`)
                .send({category: "Trasporti"});
            const updatedFaq = await FaqModel.findById(id);
            expect(res.status).toBe(200);
            expect(updatedFaq.question).toBe("QuestionToUpdate");
            expect(updatedFaq.category).toBe("Trasporti");
        })
        test("should update only question", async () => {
            const faq = await FaqModel.findOne({question: "QuestionToUpdate"});
            const id = faq._id;
            const res = await agent
                .put(`/api/faqs/${id}`)
                .send({question: "NewQuestion"});
            const updatedFaq = await FaqModel.findById(id);
            expect(res.status).toBe(200);
            expect(updatedFaq.question).toBe("NewQuestion");
            expect(updatedFaq.category).toBe("Generale");
        })
        test("should fail with invalid id", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await agent
                .put(`/api/faqs/${fakeId}`)
                .send({question: "NewQuestion", category: "Trasporti"});
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("FAQ non trovata");
        })
        test("should fail with empty id", async () => {
            const res = await agent
                .put(`/api/faqs/`)
                .send({question: "NewQuestion", category: "Trasporti"});
            expect(res.status).toBe(404);
        })
        test("should fail with invalid category", async () => {
            const faq = await FaqModel.findOne({question: "QuestionToUpdate"});
            const id = faq._id;
            const res = await agent
                .put(`/api/faqs/${id}`)
                .send({question: "NewQuestion", category: "invalid"});
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Dati non validi. Verifica che la categoria sia corretta.");
            expect(faq.question).toBe("QuestionToUpdate");
            expect(faq.category).toBe("Generale");
        })
    })
    describe("DELETE /api/faqs/:id", () => {
        const agent = request.agent(app)
        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash(validPassword, 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "operator"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: "ValidPass1!"});
            await FaqModel.create({question: "QuestionToDelete", category: "Generale"});
        })
        test("should delete a faq", async () => {
            const faq = await FaqModel.findOne({question: "QuestionToDelete"});
            const id = faq._id;
            const res = await agent.delete(`/api/faqs/${id}`);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("FAQ eliminata con successo");
            expect (res.body.deletedId).toBe(faq._id.toString());
            const deletedFaq = await FaqModel.findById(id);
            expect(deletedFaq).toBeNull();
        })
        test("should fail with invalid id", async () => {
            const fakeId = mongoose.Types.ObjectId;
            const res = await agent.delete(`/api/faqs/${fakeId}`);
            expect(res.status).toBe(500);
        })
        test("should fail with empty id", async () => {
            const res = await agent.delete(`/api/faqs/`);
            expect(res.status).toBe(404);
        })
    })
})
