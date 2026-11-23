import { Component, inject, output, signal } from '@angular/core';
import { ReportScope } from '../../models/Report';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalFrame } from '../modal-frame/modal-frame';

@Component({
  imports: [ReactiveFormsModule, ModalFrame],
  selector: 'new-report-modal',
  styleUrl: './new-report-modal.css',
  templateUrl: './new-report-modal.html',
})
export class NewReportModal {
  ReportScope = ReportScope;

  fb = inject(FormBuilder);

  selectedFile: File | null = null;
  newUserForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    reportScope: [ReportScope.Patient, Validators.required],
    templateFileData: [null as Blob | null, Validators.required]
  });

  createReportCallback = output<{title: string, reportScope: ReportScope, templateFileData: ArrayBuffer, templateFileName: string}>();
  closeModalCallback = output<void>();

  sectionCount = signal(0);

  async onCreateReport() {
    if (this.newUserForm.valid && window.confirm("Are you sure you want to create this report?\n\n" + this.reportSummary())) {
      this.createReportCallback.emit({
        title: this.newUserForm.value.title,
        reportScope: this.newUserForm.value.reportScope,
        templateFileData: await this.selectedFile!.arrayBuffer(),
        templateFileName: this.selectedFile!.name
      });
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  closeModal() {
    this.closeModalCallback.emit();
  }

  private reportSummary() : string {
    const { title } = this.newUserForm.value;
    return `Title: ${title}\nTemplate File: ${this.selectedFile?.name ?? 'None'}\nFile Size: ${this.selectedFile?.size ?? 'None'}`;
  }
}
