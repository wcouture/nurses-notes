interface Window {
    electronAPI?: {
        getPatientById: (patientId: string) => Promise<any>;
        getPatients: () => Promise<any>;
        createPatient: (name: string, email: string, phone: string, birthdate: string, streetAddress: string, cityStateZip: string, isUser: boolean) => Promise<any>;
        deletePatient: (patientId: string) => Promise<any>;
        getUser: () => Promise<any>;
        updatePatient: (id: string, name: string, email: string, phone: string, birthdate: string, streetAddress: string, cityStateZip: string) => Promise<any>;
        
        getReportById: (reportId: string) => Promise<any>;
        getReports: (reportScope: string) => Promise<any>;
        createReport: (title: string, reportScope: string, templateFileData: any, templateFileName: string) => Promise<any>;
        deleteReport: (reportId: string) => Promise<any>;
        updateReport: (reportId: string, title: string, reportScope: string) => Promise<any>;
        updateReportTemplateFile: (reportId: string, templateFileData: ArrayBuffer, templateFileName: string) => Promise<any>;

        getSections: (reportId: string) => Promise<any>;
        addSection: (reportId: string, sectionTitle: string, sectionType: string) => Promise<any>;
        deleteSection: (reportId: string, sectionId: string) => Promise<any>;
        updateSection: (reportId: string, sectionId: string, sectionValue: string) => Promise<any>;

        getReportEntries: (completedReportId: string) => Promise<any>;
        addReportEntry: (completedReportId: string, label: string, value: string, section_type: string) => Promise<any>;
        deleteReportEntry: (entryId: string) => Promise<any>;
        updateReportEntry: (entryId: string, value: string, section_type: string) => Promise<any>;
        
        getCompletedReports: (patientId: string) => Promise<any>;
        getCompletedReportsByReportId: (patientId: string, reportId: string) => Promise<any>;
        addCompletedReport: (reportId: string, patientId: string) => Promise<any>;
        deleteCompletedReport: (completedReportId: string) => Promise<any>;

        getReportExportQuestions: (reportId: string) => Promise<any>;
        addReportExportQuestion: (reportId: string, question_type: string, question: string, key: string) => Promise<any>;
        deleteReportExportQuestion: (reportId: string, questionId: string) => Promise<any>;
        updateReportExportQuestion: (reportId: string, questionId: string, question_type:string, question: string, key: string) => Promise<any>;

        generatePDF: (htmlContent: string) => Promise<any>;
    }
}