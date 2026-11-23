import { Service } from '@angular/core';
import { Patient } from '../../models/Patient';

@Service()
export class PatientService {
    public createPatient(name: string, email: string, phone: string, birthdate: string, streetAddress: string, cityStateZip: string, isUser: boolean): Promise<any> {
        return window.electronAPI?.createPatient(name, email, phone, birthdate, streetAddress, cityStateZip, isUser) ?? Promise.resolve(undefined);
    }
    
    public deletePatient(patientId: number): Promise<any> {
        return window.electronAPI?.deletePatient(patientId.toString()) ?? Promise.resolve(undefined);
    }

    public getPatientList(): Promise<Patient[] | undefined> {
        return window.electronAPI?.getPatients() ?? Promise.resolve([]);
    }

    public async getPatient(id: number): Promise<Patient | undefined> {
        const patient = await window.electronAPI?.getPatientById(id.toString()) ?? undefined;
        if (patient && patient.birthdate && patient.birthdate instanceof Date === false) {
            patient.birthdate = new Date(patient.birthdate);
        }
        return patient;
    }

    public async getUser(): Promise<Patient | undefined> {
        const user = await window.electronAPI?.getUser() ?? undefined;
        if (user && user.birthdate && user.birthdate instanceof Date === false) {
            user.birthdate = new Date(user.birthdate);
        }
        return user;
    }

    public async updatePatient(id: number, name: string, email: string, phone: string, birthdate: string, streetAddress: string, cityStateZip: string): Promise<any> {
        return window.electronAPI?.updatePatient(id.toString(), name, email, phone, birthdate, streetAddress, cityStateZip) ?? Promise.resolve(undefined);
    }
}
