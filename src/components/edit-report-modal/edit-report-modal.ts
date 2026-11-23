import { Component, inject, signal } from '@angular/core';
import { ReportScope } from '../../models/Report';
import { SectionTypePipe } from '../../pipes/section-type-pipe';
import { ReportService } from '../../services/report-service/report-service';
import { SectionService } from '../../services/section-service/section-service';
import { ReactiveFormsModule } from '@angular/forms';
import { input, output } from '@angular/core';
import { SectionType, Report } from '../../models/Report';
import { FormBuilder } from '@angular/forms';
import { ModalFrame } from '../modal-frame/modal-frame';
import { Icon } from '../icon/icon';
import { IconImage } from '../../models/IconImage';

@Component({
  imports: [ReactiveFormsModule, SectionTypePipe, ModalFrame, Icon],
  selector: 'edit-report-modal',
  styleUrl: './edit-report-modal.css',
  templateUrl: './edit-report-modal.html',
})
export class EditReportModal {
  IconImage = IconImage;
  SectionType = SectionType;
  ReportScope = ReportScope;
  EditTabs = {
    TitleScopeTemplate: 'Title/Scope/Template',
    SectionsFields: 'Sections/Fields',
    ExportQuestions: 'Export Questions'
  }

  reportId = input<number>();
  report = signal<Report | null>(null);
  selectedTemplateFile: File | null = null;
  uploadTemplateFileVisible = signal(false);
  selectedTab = signal('Title/Scope/Template');

  closeModalCallback = output<void>();

  updateReportCallback = output<{ reportId: number, title: string, reportScope: ReportScope }>();
  updateTemplateFileCallback = output<{ reportId: number, templateFileData: ArrayBuffer, templateFileName: string }>();
  
  addSectionCallback = output<{ reportId: number, sectionTitle: string, sectionType: SectionType }>();
  deleteSectionCallback = output<{ reportId: number, sectionId: number }>();

  addExportQuestionCallback = output<{reportId: number, questionType: SectionType, questionText: string, key: string }>();
  deleteExportQuestionCallback = output<{reportId: number, questionId: number}>();

  reportService = inject(ReportService);
  sectionService = inject(SectionService);
  formBuilder = inject(FormBuilder);
  
  titleForm = this.formBuilder.group({
    title: ['', { required: true }],
    reportScope: [ReportScope.Patient, { required: true }]
  });

  templateFileForm = this.formBuilder.group({
    templateFile: [null, { required: true }]
  });

  exportQuestionForm = this.formBuilder.group({
    questionText: ['', { required: true }],
    questionType: [SectionType.ShortText, { required: true }],
    questionKey: ['', { required: true }]
  });
  
  sectionForm = this.formBuilder.group({
    sectionTitle: ['', { required: true }],
    sectionType: [SectionType.ShortText, { required: true }]
  });

  onTemplateFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedTemplateFile = input.files[0];
    }
  }

  private loadReport = async () => {
    const report = await this.reportService.getReportById(this.reportId()!);
    if (report) {
      report.sections = await this.sectionService.getSections(this.reportId()!) ?? [];
      report.export_questions = await this.reportService.getExportQuestions(this.reportId()!) ?? [];
      this.titleForm.patchValue({ title: report.title, reportScope: report.report_scope });
      this.report.set(report);
    }
  };

  async ngOnInit() {
    await this.loadReport();
  }

  updateReportTitle() {
    if (this.reportId() && this.titleForm.valid) {
      this.updateReportCallback.emit({ 
        reportId: this.reportId()!,
        title: this.titleForm.value.title! as string,
        reportScope: this.titleForm.value.reportScope! as ReportScope
      })
    }
  }

  async updateTemplateFile() {
    if (this.reportId() && this.selectedTemplateFile) {
      this.updateTemplateFileCallback.emit({
        reportId: this.reportId()!,
        templateFileData: await this.selectedTemplateFile!.arrayBuffer(),
        templateFileName: this.selectedTemplateFile!.name
      });

      const report = this.report();
      if (report) {
        report.template_file = new Blob([await this.selectedTemplateFile!.arrayBuffer()]);
        report.template_file_name = this.selectedTemplateFile!.name;
        this.report.set(report);
      }
      this.selectedTemplateFile = null;
      this.templateFileForm.reset();
    }
  }

  async addSection() {
    if (this.reportId() && this.sectionForm.valid) {
      this.addSectionCallback.emit({
        reportId: this.reportId()!,
        sectionTitle: this.sectionForm.value.sectionTitle! as string,
        sectionType: this.sectionForm.value.sectionType! as SectionType
      });
      await this.loadReport();
    }
  }

  async deleteSection(sectionId: number) {
    if (this.reportId()) {
      this.deleteSectionCallback.emit({
        reportId: this.reportId()!,
        sectionId: sectionId
      });
      await this.loadReport();
    }
  }

  async addExportQuestion() {
    if (this.reportId() && this.exportQuestionForm.valid) {
      this.addExportQuestionCallback.emit({
        reportId: this.reportId()!,
        questionType: this.exportQuestionForm.value.questionType! as SectionType,
        questionText: this.exportQuestionForm.value.questionText! as string,
        key: this.exportQuestionForm.value.questionKey! as string
      });
      await this.loadReport();
    }
  }

  async deleteExportQuestion(questionId: number) {
    if (this.reportId()) {
      this.deleteExportQuestionCallback.emit({
        reportId: this.reportId()!,
        questionId: questionId
      });
      await this.loadReport();
    }
  }

  getBlobUrl(): string {
    const fileData = this.report()?.getTemplateFile();
    if (fileData === null || fileData === undefined) return '';

    const blobUrl = URL.createObjectURL(fileData);
    return blobUrl;
  }

  closeModal() {
    this.closeModalCallback.emit();
  }
}
