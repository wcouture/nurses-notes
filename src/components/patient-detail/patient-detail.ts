import { Component, signal, inject,  } from '@angular/core';
import { GenReportTableModal } from '../gen-report-table-modal/gen-report-table-modal';
import { ReportScope } from '../../models/Report';
import { Icon } from '../icon/icon';
import { IconImage } from '../../models/IconImage';
import { Report, CompletedReport } from '../../models/Report';
import { ReportService } from '../../services/report-service/report-service';
import { Patient } from '../../models/Patient';
import { PatientService } from '../../services/patient-service/patient-service';
import { ReportModal } from '../report-modal/report-modal';
import { ViewReportModal } from '../view-report-modal/view-report-modal';

@Component({
  imports: [ReportModal, Icon, ViewReportModal, GenReportTableModal],
  selector: 'patient-detail',
  styleUrl: './patient-detail.css',
  templateUrl: './patient-detail.html',
})
export class PatientDetail {
  IconImage = IconImage;
  
  userIsSelected = signal(false);
  selectedPatient = signal<Patient | undefined>(undefined);
  selectedReportId = signal<number | null>(null);
  
  selectedCompletedReportId = signal<number | null>(null);
  selectedCompletedReportTitle = signal<string | undefined>(undefined);

  reports = signal<Report[] | null>(null)
  completedReports = signal<CompletedReport[] | null>(null);
  
  reportModalVisible = signal(false);
  viewReportModalVisible = signal(false);
  exportReportModalVisible = signal(false);

  patientService = inject(PatientService);
  reportService = inject(ReportService);

  async loadReports() {
    const reports = await this.reportService.getReports(this.userIsSelected() ? ReportScope.User : ReportScope.Patient);
    const reportsCompleted = await this.reportService.getCompletedReports(this.selectedPatient()?.id ?? -1) ?? [];

    for (const completedReport of reportsCompleted) {
      const report = reports?.find(r => r.id === completedReport.report_id)
      if (report) {
        completedReport.report_title = report.title;
      }
    }
    
    this.reports.set(reports ?? []);
    this.completedReports.set(reportsCompleted);
  }

  selectReport(reportId: number) {
    this.selectedReportId.set(reportId);
  }

  toggleReportModal(visible: boolean) {
    this.reportModalVisible.set(visible);
  }

  toggleViewReportModal(visible: boolean) {
    this.viewReportModalVisible.set(visible);
  }

  toggleExportReportModal(visible: boolean) {
    this.exportReportModalVisible.set(visible);
  }

  onReportSubmitted() {
    this.loadReports();
  }

  public async updateSelectedPatient(patientId: number | null) {    
    const u = await this.patientService.getUser();
    const isUser = u?.id === patientId;
    this.userIsSelected.set(isUser);
    
    if (isUser) {
      this.selectedPatient.set(u);
    } else {
      const p = await this.patientService.getPatient(patientId!);
      this.selectedPatient.set(p);
    }

    this.selectedReportId.set(null);
    this.selectedCompletedReportId.set(null);
    this.selectedCompletedReportTitle.set(undefined);
    this.loadReports();
  }

  onExportReport(completedReportId: number) {
    console.log('Exporting completed report with ID: ', completedReportId);
  }

  viewCompletedReport(completedReportId: number, completedReportTitle: string | undefined | null) {
    this.selectedCompletedReportId.set(completedReportId);
    this.selectedCompletedReportTitle.set(completedReportTitle ?? "Title Unknown");
    this.viewReportModalVisible.set(true);
  }
}
