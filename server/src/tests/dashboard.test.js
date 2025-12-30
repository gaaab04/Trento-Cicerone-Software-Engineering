import request from 'supertest';
import app from '../indexTest.js';
import UserModel from '../models/User.js';
import bcrypt from "bcrypt";
import MessageModel from "../models/Message.js";


describe('Dashboard routes', () => {
    const validMail = "validMail@gmail.com";
    const validPassword = "ValidPass1!";
    describe("GET /api/dashboard/feedback", () => {
        const agent = request.agent(app)
        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash(validPassword, 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "operator"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: validPassword});
        })
        test("should return feedbacks", async () => {
            const message = await MessageModel.create({
                sessionId: "1234",
                role: "assistant",
                content: "message1",
                feedback: "positive",
                comment: "comment1", })
            const res = await agent.get('/api/dashboard/feedback')
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].sessionId).toBe("1234");
            expect(res.body[0].feedback).toBe("positive");
            expect(res.body[0].comment).toBe("comment1");
        })
        test("should return empty array if there are no feedbacks", async () => {
            const res = await agent.get('/api/dashboard/feedback')
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(0);
        })
    })
    describe("GET /api/dashboard/feedback/stats", () => {
        const agent = request.agent(app)
        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash(validPassword, 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "operator"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: validPassword});
        })
        test("should return last 24 hours feedbacks number", async () => {
            const message = await MessageModel.create({
                sessionId: "1234",
                role: "assistant",
                content: "message1",
                feedback: "positive",
                comment: "comment1",
            })
            const res = await agent.get('/api/dashboard/feedback/stats')
            expect(res.status).toBe(200);
            expect(res.body.positive).toBe(1);
            expect(res.body.negative).toBe(0);
            expect(res.body.total).toBe(1);
        })
        test("should return 0 feedbacks if there are no feedbacks in last 24 hours", async () => {
            const res = await agent.get('/api/dashboard/feedback/stats')
            expect(res.status).toBe(200);
            expect(res.body.positive).toBe(0);
            expect(res.body.negative).toBe(0);
            expect(res.body.total).toBe(0);
        })
    })
    describe("GET /api/dashboard/last-questions", () => {
        const agent = request.agent(app)
        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash(validPassword, 10);
            await UserModel.create({email: validMail, password: hashedPassword, role: "operator"})
            await agent
                .post('/api/login')
                .send({email: validMail, password: validPassword});
        })
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        test("should return last user messages (4 by default)", async () => {
            for (let i = 0; i < 10; i++) {
                await MessageModel.create({
                    sessionId: "1234" + i,
                    role: "user",
                    content: "message" + i,
                })
                await sleep(10)
            }
            const res = await agent.get('/api/dashboard/last-questions')
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(4);
            res.body.forEach(msg => {
                expect(msg.role).toBe("user")
            })
            expect(res.body[0].content).toBe("message9")
            expect(res.body[3].content).toBe("message6")
        })
        test("should return last 10 messages by specifying the limit", async () => {
            for (let i = 0; i < 12; i++) {
                await MessageModel.create({
                    sessionId: "1234" + i,
                    role: "user",
                    content: "message" + i,
                })
                await sleep(10)
            }
            const res = await agent.get('/api/dashboard/last-questions?limit=10')
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(10);
            res.body.forEach(msg => {
                expect(msg.role).toBe("user")
            })
            expect(res.body[0].content).toBe("message11")
            expect(res.body[9].content).toBe("message2")
        })
        test("should return empty array if there are no messages", async () => {
            const res = await agent.get('/api/dashboard/last-questions')
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(0);
        })
    })
})