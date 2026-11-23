const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Patient-related API
    createPatient: (name, email, phone, birthdate, streetAddress, cityStateZip, isUser) => ipcRenderer.invoke('create-patient', { name, email, phone, birthdate, streetAddress, cityStateZip, isUser }),
    deletePatient: (patientId) => ipcRenderer.invoke('delete-patient', patientId),
    getPatientById: (patientId) => ipcRenderer.invoke('get-patient-data', patientId),
    getPatients: () => ipcRenderer.invoke('get-patients'),
    getUser: () => ipcRenderer.invoke('get-user'),
    updatePatient: (id, name, email, phone, birthdate, streetAddress, cityStateZip) => ipcRenderer.invoke('update-patient', { id, name, email, phone, birthdate, streetAddress, cityStateZip }),

    // Report-related API
    getReportById: (reportId) => ipcRenderer.invoke('get-report-data', reportId),
    getReports: (reportScope) => ipcRenderer.invoke('get-reports', reportScope),
    createReport: (title, reportScope, templateFileData, templateFileName) => ipcRenderer.invoke('create-report', { title, reportScope, templateFileData, templateFileName }),
    deleteReport: (reportId) => ipcRenderer.invoke('delete-report', reportId),
    updateReport: (reportId, title, reportScope) => ipcRenderer.invoke('update-report', { reportId, title, reportScope }),
    updateReportTemplateFile: (reportId, templateFileData, templateFileName) => ipcRenderer.invoke('update-report-template-file', { reportId, templateFileData, templateFileName }),

    // Section-related API
    getSections: (reportId) => ipcRenderer.invoke('get-sections', reportId),
    addSection: (reportId, sectionTitle, sectionType) => ipcRenderer.invoke('add-section', { reportId, sectionTitle, sectionType }),
    deleteSection: (reportId, sectionId) => ipcRenderer.invoke('delete-section', { reportId, sectionId }),
    updateSection: (reportId, sectionId, sectionValue) => ipcRenderer.invoke('update-section', { reportId, sectionId, sectionValue }),

    // Report entry-related API
    getCompletedReports: (patientId) => ipcRenderer.invoke('get-completed-reports', patientId),
    getCompletedReportsByReportId: (patientId, reportId) => ipcRenderer.invoke('get-completed-reports-by-report-id', patientId, reportId),
    addCompletedReport: (reportId, patientId) => ipcRenderer.invoke('add-completed-report', { reportId, patientId }),
    deleteCompletedReport: (completedReportId) => ipcRenderer.invoke('delete-completed-report', { completedReportId }),

    getReportEntries: (completedReportId) => ipcRenderer.invoke('get-report-entries', completedReportId),
    addReportEntry: (completedReportId, label, value, section_type) => ipcRenderer.invoke('add-report-entry', { completedReportId, label, value, section_type }),
    deleteReportEntry: (entryId) => ipcRenderer.invoke('delete-report-entry', { entryId }),
    updateReportEntry: (entryId, value, section_type) => ipcRenderer.invoke('update-report-entry', { entryId, value, section_type }),

    // Report export question-related API
    getReportExportQuestions: (reportId) => ipcRenderer.invoke('get-report-export-questions', reportId),
    addReportExportQuestion: (reportId, question_type, question, key) => ipcRenderer.invoke('add-report-export-question', { reportId, question_type, question, key }),
    deleteReportExportQuestion: (reportId, questionId) => ipcRenderer.invoke('delete-report-export-question', { reportId, questionId }),
    updateReportExportQuestion: (reportId, questionId, question_type, question, key) => ipcRenderer.invoke('update-report-export-question', { reportId, questionId, question_type, question, key }),

    generatePDF: (htmlContent) => ipcRenderer.invoke('generate-pdf', htmlContent)
})