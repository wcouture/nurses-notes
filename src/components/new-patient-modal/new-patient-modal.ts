import { Component, output, inject, signal } from '@angular/core';
import { PatientService } from '../../services/patient-service/patient-service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import { ModalFrame } from '../modal-frame/modal-frame';

@Component({
  imports: [ReactiveFormsModule, ModalFrame],
  selector: 'new-patient-modal',
  styleUrl: './new-patient-modal.css',
  templateUrl: './new-patient-modal.html',
})
export class NewPatientModal {
  newUserForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    birthdate: new FormControl('', Validators.required),
    streetAddress: new FormControl('', Validators.required),
    cityStateZip: new FormControl('', Validators.required),
    isUser: new FormControl(false)
  })

  userExists = signal(false)

  patientService = inject(PatientService)
  createPatientCallback = output<{ name: string, email: string, phone: string, birthdate: string, streetAddress: string, cityStateZip: string, isUser: boolean }>()
  closeModalCallback = output<void>()

  async ngOnInit() {
    const user = await this.patientService.getUser();
    if (user !== null && user !== undefined) {
      this.userExists.set(true);
    }
  }

  onCreatePatient() {
    if (this.newUserForm.valid && window.confirm("Are you sure you want to create this patient?\n\n" + this.patientSummary())) {
      const { name, email, phone, birthdate, streetAddress, cityStateZip, isUser } = this.newUserForm.value;
      this.createPatientCallback.emit({name: name!, email: email!, phone: phone!, birthdate: birthdate!, streetAddress: streetAddress!, cityStateZip: cityStateZip!, isUser: isUser!});
    }
  }

  closeModal() {
    this.closeModalCallback.emit();
  }

  private patientSummary() : string {
    const { name, email, phone, birthdate, streetAddress, cityStateZip, isUser } = this.newUserForm.value;
    return `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nBirthdate: ${birthdate}\nStreet Address: ${streetAddress}\nCity/State/Zip: ${cityStateZip}\nIs User: ${isUser ? 'Yes' : 'No'}`;
  }

}
