import { Component, signal, inject,  } from '@angular/core';
import { SectionService } from '../../services/section-service/section-service';
import { ThemeManager } from '../../services/theme-manager/theme-manager';
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
import { ThemeMode } from '../../models/Theme';

class ReportData {
  report: Report | null = null;
  entries: CompletedReport[] = [];
}

@Component({
  imports: [ReportModal, Icon, ViewReportModal, GenReportTableModal],
  selector: 'patient-detail',
  styleUrl: './patient-detail.css',
  templateUrl: './patient-detail.html',
})
export class PatientDetail {
  IconImage = IconImage;
  theme = signal("");
  
  userIsSelected = signal(false);
  selectedPatient = signal<Patient | undefined>(undefined);
  selectedReportId = signal<number | null>(null);
  
  selectedCompletedReportId = signal<number | null>(null);
  selectedCompletedReportTitle = signal<string | undefined>(undefined);

  reports = signal<Report[] | null>(null)
  reportData = signal<ReportData[] | null>(null);
  
  reportModalVisible = signal(false);
  viewReportModalVisible = signal(false);
  exportReportModalVisible = signal(false);

  patientService = inject(PatientService);
  reportService = inject(ReportService);
  sectionService = inject(SectionService);
  themeManager = inject(ThemeManager);

  ngOnInit() {
    const currentTheme = this.themeManager.getTheme();
    const themeString = currentTheme === ThemeMode.Dark ? 'dark' : 'light';
    this.theme.set(themeString);

    this.themeManager.subscribe((theme) => {
      const themeString = theme === ThemeMode.Dark ? 'dark' : 'light';
      this.theme.set(themeString);
    });
  }

  async loadReports() {
    const reports = await this.reportService.getReports(this.userIsSelected() ? ReportScope.User : ReportScope.Patient);
    const reportData: ReportData[] = [];

    for (const report of reports ?? []) {
      const sections = await this.sectionService.getSections(report.id);
      report.sections = sections ?? [];

      const completedEntries = await this.reportService.getCompletedReportsByReportId(this.selectedPatient()?.id ?? -1, report.id) ?? [];
      for (const completedReport of completedEntries) {
        completedReport.report_title = report.title;
        completedReport.entries = await this.reportService.getReportEntries(completedReport.id) ?? [];
      }

      reportData.push({ report, entries: completedEntries });
    }

    this.reportData.set(reportData);
    this.reports.set(reports ?? []);
  }

  reorderCompletedReportTable(reportId: number) {
    const reportData = this.reportData() ?? [];
    if (reportData.length > 1) {
      const selectedReport = reportData?.find(rd => rd.report?.id === reportId)!;
  
      const reorderedData = [selectedReport, ...reportData?.filter(rd => rd.report?.id !== reportId) ?? [] as ReportData[]];
      if (reorderedData && reorderedData[0]) {
        this.reportData.set(reorderedData);
      }
    }
  }

  selectReport(reportId: number) {
    this.selectedReportId.set(reportId);
    this.reorderCompletedReportTable(reportId);
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
