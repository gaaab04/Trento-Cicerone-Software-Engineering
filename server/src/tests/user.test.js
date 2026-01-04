import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../indexTest.js';
import UserModel from '../models/User.js';
import MessageModel from "../models/Message.js";


describe('User routes', () => {
    const validMail = "validMail@gmail.com";
    const validPassword = "ValidPass1!";
    const agent = request.agent(app);

    // funzione per creare e loggare utenti agent
    async function createUserAndLogin( role) {
        const hashedPassword = await bcrypt.hash(validPassword, 10);
        const created = await UserModel.create({email: validMail, password: hashedPassword, role: role})
        await agent
            .post('/api/login')
            .send({email: validMail, password: validPassword});
        return created;
    }

    // funzione per creare utenti normali
    async function createUser(email, role) {
        const hashedPassword = await bcrypt.hash(validPassword, 10);
        return await UserModel.create({email: email, password: hashedPassword, role: role})
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    describe('GET /api/users/me', () => {
        test("should return user info", async () => {
            await createUserAndLogin("user");
            const res = await agent.get('/api/users/me')
            expect(res.status).toBe(200);
            expect(res.body.email).toBe(validMail);
            expect(res.body.role).toBe("user");
        })
        test("should fail if user is not logged in", async () => {
            const res = await agent.get('/api/users/me')
            expect(res.status).toBe(401);
            expect(res.body.message).toBe("utente non trovato");
        })
    })
    describe('GET /api/users/suspicious', () => {
        test("should return users that sent over than 10 messages in the last 24h", async () => {
            // operatore che chiama la rotta
            const operator = await createUserAndLogin("operator");
            // utente che invia mex
            const susUser = await createUser("test@gmail.com", "user")
            const userId = susUser._id;

            for (let i = 0; i < 11; i++) {
                await MessageModel.create({
                    sessionId: "1234" + i,
                    role: "user",
                    userId: userId,
                    content: "message" + i,})
                await sleep(10);
            }
            const res = await agent.get('/api/users/suspicious')
            expect(res.status).toBe(200);
            expect(res.body.total).toBe(1);
            expect(res.body.users[0].email).toBe(susUser.email);
            expect(res.body.users[0].messageCount).toBe(11);
        })
        test("should return users that sent over than 4 messages in the last 24h", async () => {
            const operator = await createUserAndLogin("operator");
            const susUser = await createUser("test@gmail.com", "user");
            const userId = susUser._id;
            for (let i = 0; i < 5; i++) {
                await MessageModel.create({
                    sessionId: "1234" + i,
                    role: "user",
                    userId: userId,
                    content: "message" + i,})
            }
            const res = await agent.get('/api/users/suspicious?maxMessages=4')
            expect(res.status).toBe(200);
            expect(res.body.total).toBe(1);
            expect(res.body.users[0].email).toBe(susUser.email);
            expect(res.body.users[0].messageCount).toBe(5);
        })
        test("should return empty arrau if there are no suspicious users", async () => {
            const operator = await createUserAndLogin("operator");
            const res = await agent.get('/api/users/suspicious')
            expect(res.status).toBe(200);
            expect(res.body.total).toBe(0);
            expect(res.body.users).toHaveLength(0);
        })
    })
    describe("GET /api/users/:userId/messages", () => {
        test("should return messages of a user", async () => {
            const operator = await createUserAndLogin("operator")
            const user = await createUser("test@gmail.com", "user")
            const userId = user._id;
            for (let i = 0; i < 5; i++) {
                await MessageModel.create({
                    sessionId: "1234" + i,
                    role: "user",
                    userId: userId,
                    content: "message" + i,})
                await sleep(10)
            }
            const res = await agent.get(`/api/users/${userId}/messages`)
            expect(res.status).toBe(200);
            expect(res.body.userId).toBe(userId.toString());
            expect(res.body.email).toBe(user.email);
            expect(res.body.totalMessages).toBe(5);
            expect(res.body.messages[0].content).toBe("message4");
            expect(res.body.messages[4].content).toBe("message0");
        })
        test("should return empty array if a user has no messages", async () => {
            const operator = await createUserAndLogin("operator");
            const user = await createUser("test@gmail.com", "user");
            const res = await agent.get(`/api/users/${user._id}/messages`)
            expect(res.status).toBe(200);
            expect(res.body.userId).toBe(user._id.toString());
            expect(res.body.email).toBe(user.email);
            expect(res.body.totalMessages).toBe(0);
            expect(res.body.messages).toHaveLength(0);
        })
        test("should fail if user does not exist", async() => {
            const operator = await createUserAndLogin("operator");
            const fakeId = "123456789012345678901234";
            const res = await agent.get(`/api/users/${fakeId}/messages`)
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Utente non trovato");
        })
    })
    describe("PATCH /api/users/changePassword", () => {

        test("should change user password", async () => {
            const user = await createUserAndLogin("user");
            const id = user._id;
            const res = await agent.patch('/api/users/changePassword')
                .send({oldPassword: validPassword, newPassword: "newPassword12!"})
            const updatedUser = await UserModel.findById(id);
            expect(await bcrypt.compare("newPassword12!", updatedUser.password)).toBe(true);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Password modificata con successo");
        })
        test("should fail if old password is wrong", async () => {
            const user = await createUserAndLogin("user");
            const id = user._id;
            const res = await agent.patch('/api/users/changePassword')
                .send({oldPassword: "wrongPassword123!", newPassword: "newPassword12!"})
            const updatedUser = await UserModel.findById(id);
            expect(await bcrypt.compare ("newPassword12!", updatedUser.password)).toBe(false);
            expect(res.status).toBe(401);
            expect(res.body.message).toBe("La password vecchia non coincide con quella registrata. Riprova.");
        })
        test("should fail if new password does not meet requirements", async () => {
            const user = await createUserAndLogin("user");
            const id = user._id;
            const res = await agent.patch('/api/users/changePassword')
                .send({oldPassword: validPassword, newPassword: "short"})
            const updatedUser = await UserModel.findById(id);
            expect(await bcrypt.compare("short", updatedUser.password)).toBe(false);
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("La password deve contenere almeno una lettera minuscola, una lettera maiuscola, un numero e un carattere speciale.");
        })
        test("should fail if body does not contain oldPassword and newPassword", async () => {
            const user = await createUserAndLogin("user");
            const id = user._id;
            const res = await agent.patch('/api/users/changePassword')
                .send({newPassword: "validPassword1!"})
            const updatedUser = await UserModel.findById(id);
            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Tutti i campi sono obbligatori");
            expect(await bcrypt.compare(validPassword, updatedUser.password)).toBe(true);
        })
    })
    describe ('PATCH /api/users/suspend', () => {
        test("should suspend user by mail", async () => {
            const operator = await createUserAndLogin("operator");
            const userToBan = await createUser("test@gmail.com", "user");
            expect(userToBan.suspended).toBe(false);
            const res = await agent.patch('/api/users/suspend')
                .send({email: userToBan.email})
            const user = await UserModel.findOne({email: userToBan.email});
            expect(user.suspended).toBe(true);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Utente sospeso con successo");
        })
        test("should fail if user is operator or admin", async () => {
            const operator = await createUserAndLogin("operator");
            const operatorToBan = await createUser("operator@gmail.com", "operator");
            const adminToBan = await createUser("admin@gmail.com", "admin");

            const resOperator = await agent.patch('/api/users/suspend')
                .send({email: operatorToBan.email})
            const resAdmin = await agent.patch('/api/users/suspend')
                .send({email: adminToBan.email})
            const updatedOperator = await UserModel.findOne({email: operatorToBan.email});
            const updatedAdmin = await UserModel.findOne({email: adminToBan.email});
            expect(updatedOperator.suspended).toBe(false);
            expect(updatedAdmin.suspended).toBe(false);
            expect(resOperator.status).toBe(403);
            expect(resOperator.body.message).toBe("Non puoi sospendere un admin o un operatore");
            expect(resAdmin.status).toBe(403);
            expect(resAdmin.body.message).toBe("Non puoi sospendere un admin o un operatore");
        })
        test("should fail if user does not exist", async() => {
            const operator = await createUserAndLogin("operator");
            const res = await agent.patch('/api/users/suspend')
                .send({email: "doesntExists@gmail.com"})
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Utente non trovato");
        })
    })
    describe("PATCH /api/users/unsuspend", () => {
        test("should unsuspend a user by mail", async () => {
            const operator = await createUserAndLogin("operator")
            const bannedUser = await createUser("test@gmail.com", "user");
            await UserModel.updateOne({email: bannedUser.email}, {suspended: true});
            const res = await agent.patch('/api/users/unsuspend')
                .send({email: bannedUser.email})
            const user = await UserModel.findOne({email: bannedUser.email});
            expect(user.suspended).toBe(false);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Utente riattivato con successo");
        })
        test("should fail if user does not exist", async() => {
            const operator = await createUserAndLogin("operator")
            const res = await agent.patch('/api/users/unsuspend')
                .send({email: "fakeMail@gmail.com"})
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Utente non trovato");
        })
    })
    describe("PATCH /api/users/:userId/suspend", () => {
        test("should suspend a user by userId", async () => {
            const operator = await createUserAndLogin("operator")
            const user = await createUser("test@gmail.com", "user");
            expect(user.suspended).toBe(false);
            const res = await agent.patch(`/api/users/${user._id}/suspend`)
            const updatedUser = await UserModel.findById(user._id);
            expect(updatedUser.suspended).toBe(true);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Utente sospeso con successo");
        })
        test("should fail if user is operator or admin", async () => {
            const operator = await createUserAndLogin("operator")
            const operatorToBan = await createUser("operator@gmail.com", "operator");
            const adminToBan = await createUser("admin@gmail.com", "admin");
            const resOperator = await agent.patch(`/api/users/${operatorToBan._id}/suspend`)
            const resAdmin = await agent.patch(`/api/users/${adminToBan._id}/suspend`)
            const updatedOperator = await UserModel.findById(operatorToBan._id);
            const updatedAdmin = await UserModel.findById(adminToBan._id);
            expect(updatedOperator.suspended).toBe(false);
            expect(updatedAdmin.suspended).toBe(false);
            expect(resOperator.status).toBe(403);
            expect(resOperator.body.message).toBe("Non puoi sospendere un admin o un operatore");
            expect(resAdmin.status).toBe(403);
            expect(resAdmin.body.message).toBe("Non puoi sospendere un admin o un operatore");
        })
        test("should fail if user does not exist", async() => {
            const operator = await createUserAndLogin("operator")
            const res = await agent.patch(`/api/users/123456789012345678901234/suspend`)
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Utente non trovato");
        })
    })
    describe('PATCH /api/users/:userId/unsuspend', () => {
        test("should unsuspend a user by userId", async () => {
            const operator = await createUserAndLogin("operator")
            const user = await createUser("test@gmail.com", "user");
            await UserModel.updateOne({email: user.email}, {suspended: true});
            const res = await agent.patch(`/api/users/${user._id}/unsuspend`)
            const updatedUser = await UserModel.findById(user._id);
            expect(updatedUser.suspended).toBe(false);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Utente riattivato con successo");
        })
        test("should fail if user does not exist", async() => {
            const operator = await createUserAndLogin("operator")
            const res = await agent.patch(`/api/users/123456789012345678901234/unsuspend`)
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Utente non trovato");
        })
    })
})