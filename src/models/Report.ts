export class Report {
    constructor(
        public id: number,
        public title: string,
        public report_scope: ReportScope,
        public template_file: Blob,
        public template_file_name: string,
        public sections: ReportSection[],
        public export_questions: ReportExportQuestion[]
    ) {}

    getTemplateFile(): File {
        return new File([this.template_file], this.template_file_name, { type: "application/pdf" });
    }
}

export class ReportExportQuestion {
    constructor(
        public id: number,
        public report_id: number,
        public question_type: SectionType,
        public question: string,
        public key: string,
        public value: string
    ) {}
}

export class ReportSection {
    constructor(
        public id: number,
        public report_id: number,
        public title: string,
        public type: SectionType
    ){}
}

export class ReportEntry {
    constructor(
        public id: number,
        public completed_report_id: number,
        public label: string,
        public value: string,
        public section_type: SectionType
    ) {}
}

export class CompletedReport {
    constructor(
        public id: number,
        public report_id: number,
        public patient_id: number,
        public date_completed: Date,
        public entries: ReportEntry[],
        public report_title?: string | null,
    ) {}
}

export enum SectionType {
    ShortText = 0,
    LongText = 1,
    Number = 2,
    Checkbox = 3,
    RadioButtons = 4,
    Date = 5
}

export enum ReportScope {
    User = 0,
    Patient = 1
}