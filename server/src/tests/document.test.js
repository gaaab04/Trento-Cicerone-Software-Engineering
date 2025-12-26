import {jest} from '@jest/globals'
import request from 'supertest';
import app from '../indexTest.js';
import DocumentModel from '../models/document.js';
import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import mongoose from "mongoose";
import geminiService from "../services/geminiService.js";

describe('Document routes', () => {
    const validMail = "validMail@gmail.com"
    const validPassword = "ValidPass1!"

    let geminiSpyCreateEmbedding;

    beforeAll(() => {
        // sostituisco la funzione di creazione embedding con una semplice matrice
        geminiSpyCreateEmbedding = jest.spyOn(geminiService, 'createEmbedding').mockImplementation((text) => {
            return Promise.resolve(new Array(768).fill(0.1));
        })
    })

    afterAll(() => {
        geminiSpyCreateEmbedding.mockRestore();
    })

    describe('POST /api/documents', () => {
        test("should fail if user is not admin or operator", async () => {
            const agent = request.agent(app)

            const hashedPassword = await bcrypt.hash('ValidPass1!', 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "user"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: "ValidPass1!"});

            const res = await agent
                .post('/api/documents')
                .send({title: "validTitle", content: "validContent", category: "generale", source: "test"});
            expect(res.status).toBe(403);
            expect(res.body.message).toBe("accesso negato");
        })
        test("should create a new document", async () => {
            const agent = request.agent(app)
            // creo un utente e lo loggo
            const hashedPassword = await bcrypt.hash(validPassword, 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "operator"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: validPassword});
            // creo un nuovo documento
            const res = await agent
                .post('/api/documents')
                .send({title: "validTitle", content: "validContent", category: "generale", source: "test"});
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('title', 'validTitle');
            //verifico che createEmbedding sia stato chiamato
            expect(geminiSpyCreateEmbedding).toHaveBeenCalled();
            expect(geminiSpyCreateEmbedding).toHaveBeenCalledWith("validTitle\n\nvalidContent");
        })
        test("should fail if category is not valid", async () => {
            const agent = request.agent(app)

            const hashedPassword = await bcrypt.hash(validPassword, 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "operator"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: validPassword});
            const res = await agent
                .post('/api/documents')
                .send({title: "validTitle", content: "validContent", category: "invalid", source: "test"});
            expect(res.status).toBe(500);
            expect(res.body.message).toBe("Errore nel server");
        })
        test("should fail if content is empty", async () => {
            const agent = request.agent(app)

            const hashedPassword = await bcrypt.hash(validPassword, 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "operator"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: validPassword});
            const res = await agent
                .post('/api/documents')
                .send({title: "validTitle", category: "invalid", source: "test"});
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Contenuto del documento obbligatorio");
        })
        test("should fail if title is empty", async () => {
            const agent = request.agent(app)

            const hashedPassword = await bcrypt.hash(validPassword, 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "operator"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: validPassword});
            const res = await agent
                .post('/api/documents')
                .send({content: "validContent", category: "invalid", source: "test"});
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Titolo del documento obbligatorio");
        })
    })
    describe('GET /api/documents', () => {
        test("should fail if user is not admin or operator", async () => {
            const agent = request.agent(app)

            const hashedPassword = await bcrypt.hash('ValidPass1!', 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "user"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: "ValidPass1!"});

            const res = await agent.get('/api/documents')
            expect(res.status).toBe(403);
            expect(res.body.message).toBe("accesso negato");
        })
        test("should get all documents", async () => {
            const agent = request.agent(app)

            // creo un utente e lo loggo
            const hashedPassword = await bcrypt.hash(validPassword, 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "operator"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: validPassword});

            // creo un nuovo documento
            await DocumentModel.create({
                title: "validTitle",
                content: "validContent",
                category: "generale",
                source: "test"
            })
            const res = await agent.get('/api/documents')
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
        })
    })
    describe('GET /api/documents/categories', () => {
        test("should fail if user is not admin or operator", async () => {
            const agent = request.agent(app)

            const hashedPassword = await bcrypt.hash('ValidPass1!', 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "user"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: "ValidPass1!"});

            const res = await agent.get('/api/documents/categories')
            expect(res.status).toBe(403);
            expect(res.body.message).toBe("accesso negato");
        })
        test("should get categories", async () => {
            const agent = request.agent(app)
            // creo un utente e lo loggo
            const hashedPassword = await bcrypt.hash(validPassword, 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "operator"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: validPassword});

            const res = await agent.get('/api/documents/categories')
            expect(res.status).toBe(200);
        })
    })
    describe('DELETE /api/documents/:id', () => {
        const agent = request.agent(app)

        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash('ValidPass1!', 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "admin"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: "ValidPass1!"});
        })
        test("should work with valid id", async () => {
            await DocumentModel.create({
                title: "validTitle",
                content: "validContent",
                category: "generale",
                source: "test"
            })
            const id = (await DocumentModel.find())[0]._id;
            const res = await agent.delete(`/api/documents/${id}`);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("documento eliminato con successo");
        })
        test("should fail without valid id", async () => {
            await DocumentModel.create({
                title: "validTitle",
                content: "validContent",
                category: "generale",
                source: "test"
            })
            // casto a ObjectId perché sennò non lo prende
            const invalidId = new mongoose.Types.ObjectId();
            const res = await agent.delete(`/api/documents/${invalidId}`);
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Documento non trovato");
        })
        test("should fail if there's no id", async () => {
            const res = await agent.delete(`/api/documents/`);
            expect(res.status).toBe(404);
        })
    })
    describe('PATCH /api/documents/:id', () => {
        const agent = request.agent(app)
        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash('ValidPass1!', 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "admin"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: "ValidPass1!"});
        })
        test("should work with valid body", async () => {
            await DocumentModel.create({
                title: "validTitle",
                content: "validContent",
                category: "generale",
                source: "test"
            })
            const id = (await DocumentModel.find())[0]._id;
            const res = await agent.patch(`/api/documents/${id}`).send({title: "newTitle", content: "newContent", category: "generale", source: "test"});
            expect(res.status).toBe(200);
            expect(res.body.title).toBe("newTitle");
            expect(res.body.content).toBe("newContent");
            // verifico che createEmbedding sia stato chiamato
            expect(geminiSpyCreateEmbedding).toHaveBeenCalledWith("newTitle\n\nnewContent");
        })
        test("should work with only title", async () => {
            await DocumentModel.create({
                title: "validTitle",
                content: "validContent",
                category: "generale",
                source: "test"
            })
            const id = (await DocumentModel.find())[0]._id;
            const res = await agent.patch(`/api/documents/${id}`).send({title: "newTitle"});
            expect(res.status).toBe(200);
            expect(res.body.title).toBe("newTitle");
            expect(geminiSpyCreateEmbedding).toHaveBeenCalledWith("newTitle\n\nvalidContent");
        })
        test("should work with only content", async () => {
            await DocumentModel.create({
                title: "validTitle",
                content: "validContent",
                category: "generale",
                source: "test"
            })
            const id = (await DocumentModel.find())[0]._id;
            const res = await agent.patch(`/api/documents/${id}`).send({content: "newContent"});
            expect(res.status).toBe(200);
            expect(res.body.content).toBe("newContent");
            expect(geminiSpyCreateEmbedding).toHaveBeenCalledWith("validTitle\n\nnewContent");
        })
        test("should work with only category", async () => {
            await DocumentModel.create({
                title: "validTitle",
                content: "validContent",
                category: "generale",
                source: "test"
            })
            const id = (await DocumentModel.find())[0]._id;
            const res = await agent.patch(`/api/documents/${id}`).send({category: "generale"});
            expect(res.status).toBe(200);
            expect(res.body.category).toBe("generale");
        })
        test("should work with only source", async () => {
            await DocumentModel.create({
                title: "validTitle",
                content: "validContent",
                category: "generale",
                source: "test"
            })
            const id = (await DocumentModel.find())[0]._id;
            const res = await agent.patch(`/api/documents/${id}`).send({source: "newSource"});
            expect(res.status).toBe(200);
            expect(res.body.metadata.source).toBe("newSource");
        })
        test("should fail without valid id", async () => {
            const res = await agent.patch(`/api/documents/`).send({title: "newTitle"});
            expect(res.status).toBe(404);

        })
    })
})