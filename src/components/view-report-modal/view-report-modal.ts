import { Component, inject, input, output, signal } from '@angular/core';
import { DateFormatPipe } from '../../pipes/date-format-pipe';
import { ReportService } from '../../services/report-service/report-service';
import type { ReportEntry } from '../../models/Report';
import { SectionType } from '../../models/Report';
import { ModalFrame } from '../modal-frame/modal-frame'

@Component({
  imports: [DateFormatPipe, ModalFrame],
  selector: 'view-report-modal',
  styleUrl: './view-report-modal.css',
  templateUrl: './view-report-modal.html',
})
export class ViewReportModal {
  SectionType = SectionType;

  reportService = inject(ReportService);

  entryData = signal<ReportEntry[] | undefined>(undefined);
  completedReportId = input<number | null>();
  reportTitle = input<string | undefined>(undefined);
  onCloseModal = output<void>();
  onExportReport = output<number>();

  async ngOnInit() {
    if (this.completedReportId() !== undefined && this.completedReportId() !== null) {
      const entries = await this.reportService.getReportEntries(this.completedReportId()!)
      this.entryData.set(entries);
    }
  }

  closeModal() {
    this.onCloseModal.emit();
  }

  exportReport() {
    this.onExportReport.emit(this.completedReportId()!);
  }
}
