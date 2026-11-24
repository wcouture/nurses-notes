import { Component, inject } from '@angular/core';
import { ReportService } from '../services/report-service/report-service';
import { SectionService } from '../services/section-service/section-service';
import { RouterModule } from '@angular/router';
import { ReportScope, SectionType } from '../models/Report';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  styleUrls: ['./app.css'],
  templateUrl: './app.html',
})
export class App {
  reportService = inject(ReportService);
  sectionService = inject(SectionService);

  async ngOnInit() {
    const user_reports = await this.reportService.getReports(ReportScope.User);
    const patient_reports = await this.reportService.getReports(ReportScope.Patient);

    const num_reports = (user_reports?.length ?? 0) + (patient_reports?.length ?? 0);

    if (num_reports <= 0) {
      console.log("No reports found. Creating default reports...");
      import('../util/default-data').then(async ({default: defaultReports}) => {
        console.log("Default data retrieved.")
        for (const report of defaultReports) {
          console.log(`Creating report: ${report.title}`);
          const fileResponse = await fetch(report.templateFilePath);
          const fileData = await fileResponse.arrayBuffer();
          const result = await this.reportService.createReport(report.title, report.scope, fileData, report.templateFileName);
          if (result && result.id) {
            for (const field of report.fields) {
              await this.sectionService.addSection(result.id, field.title, field.type);
            }
            for (const question of report.exportQuestions) {
              await this.reportService.addExportQuestion(result.id, question.type, question.question, question.key);
            }
          }
        }
        console.log("Default reports creation completed.");
      }); 
    }
  }

}
