import type { CompletedReport, Report, ReportSection } from '../../models/Report';
import { Component, inject, input, output, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SectionType } from '../../models/Report';
import { IconImage } from '../../models/IconImage';
import { Checkbox } from '../../components/checkbox/checkbox';
import { ReportBuilder } from '../../services/report-builder/report-builder';
import { ReportService } from '../../services/report-service/report-service';
import { SectionService } from '../../services/section-service/section-service';
import { PatientService } from '../../services/patient-service/patient-service';
import { ModalFrame } from '../modal-frame/modal-frame';
import { ThemeManager } from '../../services/theme-manager/theme-manager';
import { ThemeMode } from '../../models/Theme';

enum ExportStep {
  ExportQuestions,
  SelectEntries,
  GeneratingPDF
};
  
@Component({
  imports: [ReactiveFormsModule, Checkbox, ModalFrame],
  selector: 'gen-report-table-modal',
  styleUrl: './gen-report-table-modal.css',
  templateUrl: './gen-report-table-modal.html',
})
export class GenReportTableModal {
  // Type & Interface Aliases
  // Enum Aliases
  IconImage = IconImage;
  ExportStep = ExportStep;
  SectionType = SectionType;

  // Inputs
  reportId = input<number | null | undefined>(null);
  patientId = input<number | null | undefined>(null);

  // Outputs/Callbacks
  onCloseModal = output<void>();
  
  // Services
  reportService = inject(ReportService);
  patientService = inject(PatientService);
  sectionService = inject(SectionService);
  reportBuilder = inject(ReportBuilder);
  themeManager = inject(ThemeManager);
  
  report = signal<Report | null>(null);
  reportSections = signal<ReportSection[] | null>(null);

  completedReports = signal<CompletedReport[] | null>(null);
  selectedEntryIds: number[] = [];  
  
  themeString = signal<string>('light');
  exportStep = signal<ExportStep>(ExportStep.SelectEntries);

  exportForm = new FormGroup({});

  async ngOnInit() {
    if (this.reportId() !== null) {
      const report = await this.reportService.getReportById(this.reportId()!);
      if (report) {
        report.sections = await this.sectionService.getSections(this.reportId()!) ?? [];
        report.export_questions = await this.reportService.getExportQuestions(this.reportId()!) ?? [];
      }
      this.report.set(report ?? null);

      const completedReports = await this.reportService.getCompletedReportsByReportId(this.patientId()!, this.reportId()!);
      for (const completedReport of completedReports ?? []) {
        completedReport.entries = await this.reportService.getReportEntries(completedReport.id) ?? [];
      }

      this.completedReports.set(completedReports ?? []);
    }

    const theme = this.themeManager.getTheme();
    const themeString = theme === ThemeMode.Dark ? 'dark' : 'light';
    this.themeString.set(themeString);

    this.themeManager.subscribe((theme) => {
      const themeString = theme === ThemeMode.Dark ? 'dark' : 'light';
      this.themeString.set(themeString);
    });
  }

  public updateExportQuestion(questionId: number, value: string) {
    const report = this.report();
    const exportQuestions = report?.export_questions ?? [];
    const question = exportQuestions.find(q => q.id === questionId);
    if (question) {
      question.value = value;
      this.report.set(report);
    }
  }

  toggleEntrySelection(entryId: number) {
    const index = this.selectedEntryIds.indexOf(entryId);
    if (index > -1) {
      this.selectedEntryIds.splice(index, 1);
    } else {
      this.selectedEntryIds.push(entryId);
    }
  }

  closeModal() {
    if (this.exportStep() === ExportStep.GeneratingPDF) {
      return;
    }
    this.onCloseModal.emit();
  }

  async generatePDF(formEvent: FormDataEvent) {
    this.exportStep.set(ExportStep.GeneratingPDF);
    const formData = new FormData(formEvent.target as HTMLFormElement);
    const fields = formData.entries();
    const report = this.report()!;

    for (const q of report.export_questions) {
      const value = formData.get(q.id.toString()) ?? null;
      if (value !== null) {
        q.value = value.toString();
      }
    }

    if (this.selectedEntryIds.length === 0) {
      console.log('No entries selected for PDF generation.');
      this.exportStep.set(ExportStep.SelectEntries);
      return;
    }

    const user = await this.patientService.getUser();
    const patient = await this.patientService.getPatient(this.patientId()!)
    const selectedCompletedReports = this.completedReports()!.filter(cr => this.selectedEntryIds.includes(cr.id));
    for (const completedReport of selectedCompletedReports) {
      completedReport.entries = await this.reportService.getReportEntries(completedReport.id) ?? [];
    }
  
    const finalHtmlContent = await this.reportBuilder.buildReport(report, selectedCompletedReports, user!, patient!);
    const pdfBuffer = await this.reportBuilder.generatePDF(finalHtmlContent);
    const buffer = new Int8Array(pdfBuffer);
    const blob = new Blob([buffer], { type: 'application/pdf' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${this.report()!.title}.pdf`;
    link.click();
    URL.revokeObjectURL(link.href);

    this.exportStep.set(ExportStep.ExportQuestions);
    this.onCloseModal.emit();
  }
}
