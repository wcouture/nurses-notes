import { Component, output, input, inject, signal } from '@angular/core';
import { Checkbox } from '../checkbox/checkbox';
import { Report } from '../../models/Report';
import { ReportService } from '../../services/report-service/report-service';
import { SectionService } from '../../services/section-service/section-service';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ModalFrame } from '../modal-frame/modal-frame'

@Component({
  imports: [ReactiveFormsModule, Checkbox, ModalFrame],
  selector: 'report-modal',
  styleUrl: './report-modal.css',
  templateUrl: './report-modal.html',
})
export class ReportModal {
  reportService = inject(ReportService);
  sectionService = inject(SectionService);
  reportForm = new FormGroup({});

  report = signal<Report | undefined>(undefined);
  reportId = input<number | null>();
  patientId = input<number | null>();
  onCloseModal = output<void>();
  onReportSubmitted = output<void>();

  async ngOnInit() {
    if (this.reportId() !== undefined && this.reportId() !== null) {
      const report = await this.reportService.getReportById(this.reportId()!);
      if (report) {
        report.sections = await this.sectionService.getSections(this.reportId()!) ?? [];
        this.report.set(report);
      }
    }
  }

  closeModal() {
    this.onCloseModal.emit();
  }

  async onSubmitReport(formDataEvent: FormDataEvent) {
    const formData = new FormData(formDataEvent.target as HTMLFormElement);
    const fields = formData.entries();

    const completedReportId = (await this.reportService.addCompletedReport(this.reportId()!, this.patientId()!)).id;
    if (completedReportId === undefined || completedReportId === null) {
      console.error('Failed to create completed report');
      return;
    }

    for (const [key, value] of fields) {
      const [sectionTitle, sectionType] = key.split(';');
      const sectionTypeNumber = parseInt(sectionType, 10);
      await this.reportService.addReportEntry(completedReportId, sectionTitle, value.toString(), sectionTypeNumber);
    }

    this.onReportSubmitted.emit();
    this.onCloseModal.emit();
  }
}
