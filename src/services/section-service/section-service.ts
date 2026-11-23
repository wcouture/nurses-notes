import { Service } from '@angular/core';
import type { ReportSection, SectionType } from '../../models/Report';

@Service()
export class SectionService {
    public getSections(reportId: number): Promise<ReportSection[] | undefined> {
        return window.electronAPI?.getSections(reportId.toString()) ?? Promise.resolve(undefined);
    }

    public addSection(reportId: number, sectionTitle: string, sectionType: SectionType): Promise<any> {
        return window.electronAPI?.addSection(reportId.toString(), sectionTitle, sectionType.valueOf().toString()) ?? Promise.resolve(undefined);
    }

    public deleteSection(reportId: number, sectionId: number): Promise<any> {
        return window.electronAPI?.deleteSection(reportId.toString(), sectionId.toString()) ?? Promise.resolve(undefined);
    }

    public updateSection(reportId: number, sectionId: number, sectionValue: string): Promise<any> {
        return window.electronAPI?.updateSection(reportId.toString(), sectionId.toString(), sectionValue) ?? Promise.resolve(undefined);
    }
}
