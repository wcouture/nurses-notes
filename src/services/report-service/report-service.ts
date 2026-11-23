import { Service } from '@angular/core';
import { Report, CompletedReport, ReportEntry, ReportScope, ReportExportQuestion, SectionType } from '../../models/Report';

@Service()
export class ReportService {
    public async getReports(reportScope: ReportScope): Promise<Report[] | undefined> {
        const raw = await window.electronAPI?.getReports(reportScope.valueOf().toString()) ?? Promise.resolve(undefined);
        if (!raw) return undefined;
        return raw.map((r: any) => this.convertToReport(r));
    }

    public async getReportById(reportId: number): Promise<Report | undefined> {
        const raw = await window.electronAPI?.getReportById(reportId.toString()) ?? Promise.resolve(undefined);
        if (!raw) return undefined;
        return this.convertToReport(raw);
    }
    
    public createReport(title: string, reportScope: ReportScope, templateFileData: any, templateFileName: string): Promise<any> {
        return window.electronAPI?.createReport(title, reportScope.valueOf().toString(), templateFileData, templateFileName) ?? Promise.resolve(undefined);
    }

    public deleteReport(reportId: number): Promise<any> {
        return window.electronAPI?.deleteReport(reportId.toString()) ?? Promise.resolve(undefined);
    }

    public updateReport(reportId: number, title: string, reportScope: ReportScope): Promise<any> {
        return window.electronAPI?.updateReport(reportId.toString(), title, reportScope.valueOf().toString()) ?? Promise.resolve(undefined);
    }

    public updateReportTemplateFile(reportId: number, templateFileData: ArrayBuffer, templateFileName: string): Promise<any> {
        return window.electronAPI?.updateReportTemplateFile(reportId.toString(), templateFileData, templateFileName) ?? Promise.resolve(undefined);
    }

    public getReportEntries(completedReportId: number): Promise<ReportEntry[] | undefined> {
        return window.electronAPI?.getReportEntries(completedReportId.toString()) ?? Promise.resolve(undefined);
    }

    public addReportEntry(completedReportId: number, label: string, value: string, section_type: SectionType): Promise<any> {
        return window.electronAPI?.addReportEntry(completedReportId.toString(), label, value, section_type.valueOf().toString()) ?? Promise.resolve(undefined);
    }

    public deleteReportEntry(entryId: number): Promise<any> {
        return window.electronAPI?.deleteReportEntry(entryId.toString()) ?? Promise.resolve(undefined);
    }

    public updateReportEntry(entryId: number, value: string, section_type: SectionType): Promise<any> {
        return window.electronAPI?.updateReportEntry(entryId.toString(), value, section_type.valueOf().toString()) ?? Promise.resolve(undefined);
    }

    public getCompletedReports(patientId: number): Promise<CompletedReport[] | undefined> {
        return window.electronAPI?.getCompletedReports(patientId.toString()) ?? Promise.resolve(undefined);
    }

    public getCompletedReportsByReportId(patientId: number, reportId: number): Promise<CompletedReport[] | undefined> {
        return window.electronAPI?.getCompletedReportsByReportId(patientId.toString(), reportId.toString()) ?? Promise.resolve(undefined);
    }

    public addCompletedReport(reportId: number, patientId: number): Promise<any> {
        return window.electronAPI?.addCompletedReport(reportId.toString(), patientId.toString()) ?? Promise.resolve(undefined);
    }

    public deleteCompletedReport(completedReportId: number): Promise<any> {
        return window.electronAPI?.deleteCompletedReport(completedReportId.toString()) ?? Promise.resolve(undefined);
    }

    public getExportQuestions(reportId: number): Promise<ReportExportQuestion[] | undefined> {
        return window.electronAPI?.getReportExportQuestions(reportId.toString()) ?? Promise.resolve(undefined);
    }

    public addExportQuestion(reportId: number, question_type: SectionType, question: string, key: string): Promise<any> {
        return window.electronAPI?.addReportExportQuestion(reportId.toString(), question_type.valueOf().toString(), question, key) ?? Promise.resolve(undefined);
    }

    public deleteExportQuestion(reportId: number, questionId: number): Promise<any> {
        return window.electronAPI?.deleteReportExportQuestion(reportId.toString(), questionId.toString()) ?? Promise.resolve(undefined);
    }

    public updateExportQuestion(reportId: number, questionId: number, question_type: SectionType, question: string, key: string): Promise<any> {
        return window.electronAPI?.updateReportExportQuestion(reportId.toString(), questionId.toString(), question_type.valueOf().toString(), question, key) ?? Promise.resolve(undefined);
    }

    private convertToReport(raw: any): Report {
        const templateBlob = this.toBlob(raw.template_file);
        return new Report(
            raw.id,
            raw.title,
            raw.report_scope,
            templateBlob,
            raw.template_file_name,
            [], // load sections separately later,
            [] // load export questions separately later
        );
    }

    private toBlob(data: any): Blob {
        if (data instanceof Blob) return data;
        if (data instanceof ArrayBuffer) return new Blob([data]);
        if (data && data.type === 'Buffer') {
            return new Blob([new Uint8Array(data.data)]);
        }
        return new Blob([data]);
    }
}
