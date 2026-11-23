import { Component, signal, inject } from '@angular/core';
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

@Component({
  imports: [ReactiveFormsModule, RouterLink, NewPatientModal, EditPatientModal, NewReportModal, Icon, EditReportModal, ReportScopePipe],
  selector: 'app-admin-page',
  styleUrl: './admin-page.css',
  templateUrl: './admin-page.html',
})
export class AdminPage {
  modalState = signal("closed");
  editReportId = signal(-1);
  editPatientId = signal(-1);

  IconImage = IconImage;
  patientService = inject(PatientService);
  reportService = inject(ReportService);
  sectionService = inject(SectionService);
  router = inject(Router); 
  
  patients = signal([] as Patient[]);
  reports = signal([] as Report[]);

  private loadPatients = async () => {
    const patients = await this.patientService.getPatientList();
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
}
