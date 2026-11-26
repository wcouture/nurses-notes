import { Component, signal, inject } from '@angular/core';
import { ThemeManager } from '../../services/theme-manager/theme-manager';
import { EditPatientModal } from '../../components/edit-patient-modal/edit-patient-modal';
import { SectionService } from '../../services/section-service/section-service';
import { NewPatientModal } from '../../components/new-patient-modal/new-patient-modal';
import { NewReportModal } from '../../components/new-report-modal/new-report-modal';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Patient } from '../../models/Patient';
import { Report, ReportSection, SectionType } from '../../models/Report';
import { PatientService } from '../../services/patient-service/patient-service';
import { ReportService } from '../../services/report-service/report-service';
import { Icon } from '../../components/icon/icon';
import { IconImage } from '../../models/IconImage';
import { EditReportModal } from '../../components/edit-report-modal/edit-report-modal';
import { ReportScope } from '../../models/Report';
import { ReportScopePipe } from '../../pipes/report-scope-pipe';
import { ToggleSwitch } from '../../components/toggle-switch/toggle-switch';
import { ThemeMode } from '../../models/Theme';
import { ThemeStringPipe } from '../../pipes/theme-string-pipe/theme-string-pipe';

@Component({
  imports: [ReactiveFormsModule, 
            RouterLink, 
            NewPatientModal, 
            EditPatientModal, 
            NewReportModal, 
            Icon, 
            EditReportModal, 
            ReportScopePipe, 
            ToggleSwitch,
            ThemeStringPipe],
  selector: 'app-admin-page',
  styleUrl: './admin-page.css',
  templateUrl: './admin-page.html',
})
export class AdminPage {
  modalState = signal("closed");
  editReportId = signal(-1);
  editPatientId = signal(-1);

  IconImage = IconImage;
  ThemeMode = ThemeMode;
  patientService = inject(PatientService);
  reportService = inject(ReportService);
  sectionService = inject(SectionService);
  themeManager = inject(ThemeManager);
  router = inject(Router); 

  user = signal(undefined as Patient | undefined | null);
  patients = signal([] as Patient[]);
  reports = signal([] as Report[]);
  theme = signal("");

  private loadPatients = async () => {
    const patients = await this.patientService.getPatientList();
    const user = await this.patientService.getUser();
    this.user.set(user ?? null);
    this.patients.set(patients ?? []);
  };

  private loadReports = async () => {
    const patientReports = await this.reportService.getReports(ReportScope.Patient);
    const userReports = await this.reportService.getReports(ReportScope.User);

    const reports = [...(patientReports ?? []), ...(userReports ?? [])];
    for (const report of reports ?? []) {
      report.sections = await this.loadSections(report.id);
    }
    this.reports.set(reports ?? []);
  };

  private loadSections = async (reportId: number): Promise<ReportSection[]> => {
    const sections = await this.sectionService.getSections(reportId);
    return sections ?? [];
  };

  async ngOnInit() {
    await this.loadPatients();
    await this.loadReports();

    const theme = await this.themeManager.getTheme();
    const themeString = theme === ThemeMode.Dark ? "dark" : "light";
    this.theme.set(themeString);

    this.themeManager.subscribe((newTheme) => {
      const themeString = newTheme === ThemeMode.Dark ? "dark" : "light";
      this.theme.set(themeString);
    });
  }

  // Create =============================================================================
  async onCreatePatient(name: string, email: string, phone: string, birthdate: string, streetAddress: string, cityStateZip: string, isUser: boolean) {
    await this.patientService.createPatient(name, email, phone, birthdate, streetAddress, cityStateZip, isUser);
    this.modalState.set("closed");
    await this.loadPatients();
  }

  async onCreateReport(title: string, reportScope: ReportScope, templateFileData: ArrayBuffer, templateFileName: string) {
    await this.reportService.createReport(title, reportScope, templateFileData, templateFileName);
    this.modalState.set("closed");
    await this.loadReports();
  }

  async onAddSection(reportId: number, sectionTitle: string, sectionType: SectionType) {
    await this.sectionService.addSection(reportId, sectionTitle, sectionType);
    await this.loadReports();
  }

  async onAddExportQuestion(reportId: number, questionType: SectionType, question: string, key: string) {
    await this.reportService.addExportQuestion(reportId, questionType, question, key);
    await this.loadReports();
  }
  // ====================================================================================

  // Delete =============================================================================
  async deletePatient(patientId: number) {
    await this.patientService.deletePatient(patientId);
    await this.loadPatients();
  }

  async deleteReport(reportId: number) {
    await this.reportService.deleteReport(reportId);
    await this.loadReports();
  }

  async deleteSection(reportId: number, sectionId: number) {
    await this.sectionService.deleteSection(reportId, sectionId);
    await this.loadReports();
  }

  async deleteExportQuestion(reportId: number, questionId: number) {
    await this.reportService.deleteExportQuestion(reportId, questionId);
    await this.loadReports();
  }
  // ====================================================================================

  // Edit ================================================================================
  onToggleTheme(selectedTheme: string) {
    switch(selectedTheme) {
      case ThemeMode.Light.toString():
        this.themeManager.setTheme(ThemeMode.Light);
        break;
      case ThemeMode.Dark.toString():
        this.themeManager.setTheme(ThemeMode.Dark);
        break;
    }
  }

  editReport(reportId: number) {
    this.editReportId.set(reportId);
    this.openModal("editReport");
  }

  editPatient(patientId: number) {
    this.editPatientId.set(patientId);
    this.openModal("editPatient");
  }

  async updateReport(reportId: number, title: string, reportScope: ReportScope) {
    await this.reportService.updateReport(reportId, title, reportScope);
    await this.loadReports();
  }

  async updatePatient(id: number, name: string, email: string, phone: string, birthdate: string, streetAddress: string, cityStateZip: string) {
    await this.patientService.updatePatient(id, name, email, phone, birthdate, streetAddress, cityStateZip);
    this.closeModal();
    await this.loadPatients();
  }

  async updateTemplateFile(reportId: number, templateFileData: ArrayBuffer, templateFileName: string) {
    await this.reportService.updateReportTemplateFile(reportId, templateFileData, templateFileName);
    await this.loadReports();
  }
  // ====================================================================================

  closeModal() {
    this.modalState.set("closed");
  }

  openModal(state: string) {
    this.modalState.set(state);
  }

  getDateString(date: Date | undefined): string {
    if (!date) {
      return '';
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months are zero-based
    const day = date.getDate();

    return `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
  }
}
