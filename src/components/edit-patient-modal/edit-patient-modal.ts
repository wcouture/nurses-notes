import { Component, inject, signal, output, input } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient-service/patient-service';
import { Patient } from '../../models/Patient';
import { ModalFrame } from '../modal-frame/modal-frame'

@Component({
  imports: [ReactiveFormsModule, ModalFrame],
  selector: 'edit-patient-modal',
  styleUrl: './edit-patient-modal.css',
  templateUrl: './edit-patient-modal.html',
})
export class EditPatientModal {
  editUserForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    birthdate: new FormControl('', Validators.required),
    streetAddress: new FormControl('', Validators.required),
    cityStateZip: new FormControl('', Validators.required),
  })

  userExists = signal(false)

  patientId = input<number>();
  patient = signal<Patient | null>(null);

  patientService = inject(PatientService)
  closeModalCallback = output<void>()
  editPatientCallback = output<{id: number, name: string, email: string, phone: string, birthdate: string, streetAddress: string, cityStateZip: string}>()

  async ngOnInit() {
    if (!this.patientId())
      return;

    const patient = await this.patientService.getPatient(this.patientId()!);
    if (patient) {
      this.patient.set(patient);
      const formattedBirthdate = formatDate(patient.birthdate, 'yyyy-MM-dd', 'en-US');
      console.log(formattedBirthdate);

      this.editUserForm.patchValue({
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        birthdate: formattedBirthdate,
        streetAddress: patient.street_address,
        cityStateZip: patient.city_state_zip
      });
    }
  }

  async onEditPatient() {
    if (this.editUserForm.valid && window.confirm(`Are you sure you want to save the following changes?\n\n${this.patientSummary()}`)) {
      const { name, email, phone, birthdate, streetAddress, cityStateZip } = this.editUserForm.value;
      this.editPatientCallback.emit({
        id: this.patientId()!,
        name: name!,
        email: email!,
        phone: phone!,
        birthdate: birthdate!,
        streetAddress: streetAddress!,
        cityStateZip: cityStateZip!
      });
    }
  }

  closeModal() {
    this.closeModalCallback.emit();
  }

  private patientSummary() : string {
    const { name, email, phone, birthdate, streetAddress, cityStateZip } = this.editUserForm.value;
    return `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nBirthdate: ${birthdate}\nStreet Address: ${streetAddress}\nCity/State/Zip: ${cityStateZip}`;
  }
}
