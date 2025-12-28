import {jest} from '@jest/globals'
import request from 'supertest'
import app from '../indexTest.js'
import UserModel from '../models/user.js'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import ServiceModel from '../models/ServiceStatus.js'
import serviceStatusManager from '../services/serviceStatusManager.js'
import {verifyRagStatus} from "../middleware/serviceStatusMiddleware.js";

describe('Service routes', () => {
    const validMail = "validMail@gmail.com"
    const validPassword = "ValidPass1!"
    const agent = request.agent(app)
    let setRagStatusSpy
    let isRagEnabledSpy

    beforeAll(() => {
        // mock di setRagStatus che abilita o disabilita il servizio
        setRagStatusSpy = jest.spyOn(serviceStatusManager, 'setRagStatus')
        // mock di isRagEnabled che legge lo stato del servizio
        isRagEnabledSpy = jest.spyOn(serviceStatusManager, 'isRagEnabled')
    })
    afterAll(() => {
        setRagStatusSpy.mockRestore()
        isRagEnabledSpy.mockRestore()
    })

    // creo un utente e lo loggo
    beforeEach(async () => {
        const hashedPassword = await bcrypt.hash(validPassword, 10);
        await UserModel.create({email: validMail, password: hashedPassword, role: "operator"})
        await agent
            .post('/api/login')
            .send({email: validMail, password: "ValidPass1!"});
    })

    describe('GET /api/services/status', () => {
        test("should return status if present", async () => {
            await ServiceModel.create({
                enabled: true,
                maintenanceMessage: null
            })
            const res = await agent.get('/api/services/status')
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('serviceStatus');
            expect(res.body.serviceStatus.enabled).toBe(true);
        })
        test("should fail if service status is not present", async () => {
            const res = await agent.get('/api/services/status')
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Stato non trovato");
        })
    })
    describe("POST /api/services/enable", () => {
        test("should enable service", async() => {
            setRagStatusSpy.mockResolvedValueOnce(true)
            const res = await agent.post('/api/services/enable')
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Servizio abilitato con successo");
            expect(setRagStatusSpy).toHaveBeenCalledWith(true)
        })
        test("shoulf fail if enabling throws an error", async() => {
            setRagStatusSpy.mockRejectedValueOnce(new Error("Errore nel server"))
            const res = await agent.post('/api/services/enable')
            expect(res.status).toBe(500);
            expect(res.body.message).toBe("Impossibile abilitare il servizio");
        })
    })
    describe("POST /api/services/disable", () => {
        test("should disable service", async() => {
            setRagStatusSpy.mockResolvedValueOnce()
            const res = await agent.post('/api/services/disable')
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Servizio disabilitato con successo");
            expect(setRagStatusSpy).toHaveBeenCalledWith(false)
        })
        test("shoulf fail if disabling throws an error", async() => {
            setRagStatusSpy.mockRejectedValueOnce(new Error("Impossibile disabilitare il servizio"))
            const res = await agent.post('/api/services/disable')
            expect(res.status).toBe(500);
            expect(res.body.message).toBe("Impossibile disabilitare il servizio");
        })
    })
    describe("verifyRagStatus middleware", () => {
        test("shouldnt modify request if service is enabled", async () => {
            // simulo che il servizio sia attivo
            isRagEnabledSpy.mockReturnValue(true)
            await ServiceModel.create({
                enabled: true,
                maintenanceMessage: null
            })
            const req = {}
            const res = {}
            await verifyRagStatus(req, res)

            expect(req.isRagDisabled).toBeUndefined()
            expect(req.maintenanceMessage).toBeUndefined()
        })
        test("should modify request if service is disabled", async () => {
            isRagEnabledSpy.mockReturnValue(false)
            await ServiceModel.create({
                enabled: false,
                maintenanceMessage: "Servizio in manutenzione"
            })
            const req = {}
            const res = {}
            await verifyRagStatus(req, res)

            expect(req.isRagDisabled).toBe(true)
            expect(req.maintenanceMessage).toBe("Servizio in manutenzione")
        })
        }
    )

})