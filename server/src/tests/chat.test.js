import {jest} from "@jest/globals"
import request from 'supertest';
import app from '../indexTest.js';
import UserModel from '../models/User.js';
import bcrypt from "bcrypt";
import MessageModel from "../models/Message.js";
import ragService from '../services/ragService.js';
import serviceStatusManager from "../services/serviceStatusManager.js";
import ServiceModel from "../models/ServiceStatus.js";

describe('Chat routes', () => {
    const validMail = "validMail@gmail.com";
    const validPassword = "ValidPass1!";
    const agent = request.agent(app);

    let processQuerySpy;
    let isRagEnabledSpy;

    beforeAll(() => {
        processQuerySpy = jest.spyOn(ragService, "processQuery");
        isRagEnabledSpy = jest.spyOn(serviceStatusManager, "isRagEnabled");
    })

    afterAll(async () => {
        processQuerySpy.mockRestore();
        isRagEnabledSpy.mockRestore();
    })

    afterEach(async () => {
        jest.clearAllMocks();
    })

    beforeEach(async () => {
        const hashedPassword = await bcrypt.hash(validPassword, 10);
        await UserModel.create({email: validMail, password: hashedPassword, role: "operator"})
        await agent
            .post('/api/login')
            .send({email: validMail, password: validPassword});
    })

    describe('POST /api/chat', () => {
        test("should send a message and receive bot's response", async () => {
            processQuerySpy.mockResolvedValue({
                response: "Bot response",
            })
            isRagEnabledSpy.mockReturnValue(true);
            const res = await agent.post('/api/chat').send({
                message: "test message",
                sessionId: "1234"
            })
            expect(res.status).toBe(200);
            expect(res.body.response).toBe("Bot response");

            const messages = await MessageModel.find({sessionId: "1234"});
            expect(messages).toHaveLength(2);
            expect(messages[0].content).toBe("test message");
            expect(messages[1].content).toBe("Bot response");
            expect(messages[0].role).toBe("user");
            expect(messages[1].role).toBe("assistant");
        })
        test("should return maintenance message if RAG is disabled", async () => {
            isRagEnabledSpy.mockReturnValue(false);

            await ServiceModel.create({
                enabled: false,
                maintenanceMessage: "Maintenance message"
            })
            const res = await agent.post('/api/chat').send({
                sessionId: "1234",
                message: "test message"
            })

            expect(res.status).toBe(200);
            expect(res.body.response).toBe("Maintenance message");
            expect(processQuerySpy).not.toHaveBeenCalled();

            const messages = await MessageModel.find({sessionId: "1234"});
            expect(messages).toHaveLength(2);
            expect(messages[0].content).toBe("test message");
            expect(messages[0].role).toBe("user");
            expect(messages[1].content).toBe("Maintenance message");
            expect(messages[1].role).toBe("assistant");
        })
        test("should fail if sessionId is missing", async () => {
            isRagEnabledSpy.mockReturnValue(true);

            const res = await agent.post('/api/chat').send({
                message: "ciao"
            })
            expect(res.status).toBe(400);
            expect(processQuerySpy).not.toHaveBeenCalled();
        })
        test("should fail if message is missing", async () => {
            isRagEnabledSpy.mockReturnValue(true);

            const res = await agent.post('/api/chat').send({
                sessionId: "1234",
                message: ""
            })
            expect(res.status).toBe(400);
            expect(processQuerySpy).not.toHaveBeenCalled();
        })
    })
    describe('GET /api/chat/session', () => {
        test("should create a new session and return a session id", async () => {
            const res = await agent.get('/api/chat/session')
            expect(res.status).toBe(200);
            expect(res.body.sessionId).toBeDefined();
            const messages = await MessageModel.find({sessionId: res.body.sessionId});
            expect(messages).toHaveLength(0);
        })
    })
    describe('POST /api/chat/:messageId/feedback', () => {
        test("should send a feedback with comment", async () => {
            const message = await MessageModel.create({
                sessionId: "1234",
                role: "assistant",
                content: "this is a test message"
            })
            expect (message.feedback).toBe(null)
            const id = message._id;
            const res = await agent
                .post(`/api/chat/${id}/feedback`)
                .send({feedback: "positive", comment: "comment"})
            expect(res.status).toBe(200);
            const updatedMessage = await MessageModel.findById(id);
            expect(updatedMessage.feedback).toBe("positive");
            expect(updatedMessage.comment).toBe("comment");
        })
        test("should send a feedback without comment", async () => {
            const message = await MessageModel.create({
                sessionId: "1234",
                role: "assistant",
                content: "this is a test message"
            })
            expect (message.feedback).toBe(null)
            const id = message._id;
            const res = await agent
                .post(`/api/chat/${id}/feedback`)
                .send({feedback: "positive"})
            expect(res.status).toBe(200);
            const updatedMessage = await MessageModel.findById(id);
            expect(updatedMessage.feedback).toBe("positive");
            expect(updatedMessage.comment).toBe('');
        })
        test("should fail if feedback type is missing", async () => {
            const message = await MessageModel.create({
                sessionId: "1234",
                role: "assistant",
                content: "this is a test message"
            })
            const id = message._id;
            const res = await agent
                .post(`/api/chat/${id}/feedback`)
                .send({comment: "comment"})
            expect(res.status).toBe(400);
        })
        test("should fail if feedback type is invalid", async () => {
            const message = await MessageModel.create({
                sessionId: "1234",
                role: "assistant",
                content: "this is a test message"
            })
            const id = message._id;
            const res = await agent
                .post(`/api/chat/${id}/feedback`)
                .send({feedback: "invalidFeedback", comment: "comment"})
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("tipo di feedback non valido. deve essere positive o negative");
        })
    })
    describe("GET /api/chat/:sessionId", () => {
        test("should return messages for a given session id", async () => {
            const message1 = await MessageModel.create({sessionId: "1234", role: "user", content: "message1"});
            const message2 = await MessageModel.create({sessionId: "1234", role: "assistant", content: "message2"});
            const res = await agent.get(`/api/chat/${message1.sessionId}`)
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].content).toBe("message1");
            expect(res.body[1].content).toBe("message2");
        })
        test("should return empty array if there are no messages for the given session id", async () => {
            const res = await agent.get(`/api/chat/12345`)
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(0);
        })
    })

})