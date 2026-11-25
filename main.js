const puppeteer = require('puppeteer');
const { DatabaseSync } = require('node:sqlite');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

if (require('electron-squirrel-startup')) {
    app.quit();
    return;
}

let browser;
let mainWindow;
const db = new DatabaseSync('nurses-notes.db');


async function generatePDF(htmlContent) {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: { top: '0px', bottom: '0px' },
    });

    await page.close();
    return pdfBuffer;
}

async function initializePuppeteer() {
    browser = await puppeteer.launch({ headless: true });

    ipcMain.handle('generate-pdf', async (event, htmlContent) => {
        const pdfBuffer = await generatePDF(htmlContent);
        return pdfBuffer;
    });
}

function ensurePatientsTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            birthdate DATE,
            street_address TEXT,
            city_state_zip TEXT,
            email TEXT,
            phone TEXT,
            is_user BOOLEAN
        );
    `);
}

function ensureReportsTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            report_scope INTEGER,
            template_file BLOB,
            template_file_name TEXT
        );
    `);
}

function ensureReportExportQuestionTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS report_export_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_id INTEGER,
            question_type INTEGER,
            question TEXT,
            key TEXT,
            FOREIGN KEY(report_id) REFERENCES reports(id)
        );
    `);
}

function ensureReportSectionsTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS report_sections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_id INTEGER,
            title TEXT,
            type INTEGER,
            FOREIGN KEY(report_id) REFERENCES reports(id)
        );
    `);
}

function ensureCompletedReportsTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS completed_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_id INTEGER,
            patient_id INTEGER,
            date_completed DATE DEFAULT CURRENT_DATE,
            FOREIGN KEY(report_id) REFERENCES reports(id),
            FOREIGN KEY(patient_id) REFERENCES patients(id)
        );
    `);
}

function ensureReportEntriesTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS report_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            completed_report_id INTEGER,
            label TEXT,
            value TEXT,
            section_type INTEGER,
            FOREIGN KEY(completed_report_id) REFERENCES completed_reports(id)
        );
    `);
}

function ensureDbTablesCreated() {
    ensurePatientsTable();
    ensureReportsTable();
    ensureReportExportQuestionTable();
    ensureReportSectionsTable();
    ensureCompletedReportsTable();
    ensureReportEntriesTable();
}

function configurePatientIpcHandlers() {
    // Patient-related IPC handlers
    ipcMain.handle('get-patient-data', (event, patientId) => {
        const stmt = db.prepare('SELECT * FROM patients WHERE id = ?');
        return stmt.get(patientId);
    });
    ipcMain.handle('get-patients', (event) => {
        const stmt = db.prepare('SELECT * FROM patients WHERE is_user = 0');
        const data = stmt.all();
        return data;
    });
    ipcMain.handle('create-patient', (event, { name, email, phone, birthdate, isUser, streetAddress, cityStateZip }) => {
        const stmt = db.prepare('INSERT INTO patients (name, birthdate, email, phone, is_user, street_address, city_state_zip) VALUES (?, ?, ?, ?, ?, ?, ?)');
        const result = stmt.run(name, birthdate, email, phone, isUser, streetAddress, cityStateZip);
        return { id: result.lastInsertRowid };
    });
    ipcMain.handle('delete-patient', (event, patientId) => {
        const stmt = db.prepare('DELETE FROM patients WHERE id = ?');
        const result = stmt.run(patientId);
        return { changes: result.changes };
    });
    ipcMain.handle('get-user', (event) => {
        const stmt = db.prepare('SELECT * FROM patients WHERE is_user = 1');
        return stmt.get();
    });

    ipcMain.handle('update-patient', (event, { id, name, email, phone, birthdate, streetAddress, cityStateZip}) => {
        const stmt = db.prepare('UPDATE patients SET name = ?, email = ?, phone = ?, birthdate = ?, street_address = ?, city_state_zip = ? WHERE id = ?');
        const result = stmt.run(name, email, phone, birthdate, streetAddress, cityStateZip, id);
        return { changes: result.changes };
    });
}

function configureReportIpcHandlers() {
    // Report-related IPC handlers
    ipcMain.handle('get-report-data', (event, reportId) => {
        const stmt = db.prepare('SELECT * FROM reports WHERE id = ?');
        return stmt.get(reportId);
    });
    ipcMain.handle('get-reports', (event, reportScope) => {
        const stmt = db.prepare('SELECT * FROM reports WHERE report_scope = ?');
        return stmt.all(reportScope);
    });
    ipcMain.handle('create-report', (event, { title, reportScope, templateFileData, templateFileName }) => {
        const fileBuffer = Buffer.isBuffer(templateFileData) ? templateFileData : Buffer.from(templateFileData);
        const stmt = db.prepare('INSERT INTO reports (title, report_scope, template_file, template_file_name) VALUES (?, ?, ?, ?)');
        const result = stmt.run(title, reportScope, fileBuffer, templateFileName);
        const reportId = result.lastInsertRowid;
        return { id: reportId };
    });
    ipcMain.handle('delete-report', (event, reportId) => {
        const stmt = db.prepare('DELETE FROM reports WHERE id = ?');
        const result = stmt.run(reportId);
        return { changes: result.changes };
    });
    ipcMain.handle('update-report', (event, { reportId, title, reportScope }) => {
        const stmt = db.prepare('UPDATE reports SET title = ?, report_scope = ? WHERE id = ?');
        const result = stmt.run(title, reportScope, reportId);
        return { changes: result.changes };
    });
    ipcMain.handle('update-report-template-file', (event, { reportId, templateFileData, templateFileName }) => {
        const fileBuffer = Buffer.isBuffer(templateFileData) ? templateFileData : Buffer.from(templateFileData);
        const stmt = db.prepare('UPDATE reports SET template_file = ?, template_file_name = ? WHERE id = ?');
        const result = stmt.run(fileBuffer, templateFileName, reportId);
        return { changes: result.changes };
    });
}

function configureReportExportQuestionIpcHandlers() {
    ipcMain.handle('get-report-export-questions', (event, reportId) => {
        const stmt = db.prepare('SELECT * FROM report_export_questions WHERE report_id = ?');
        return stmt.all(reportId);
    });
    ipcMain.handle('add-report-export-question', (event, { reportId, question_type, question, key }) => {
        const stmt = db.prepare('INSERT INTO report_export_questions (report_id, question_type, question, key) VALUES (?, ?, ?, ?)');
        const result = stmt.run(reportId, question_type, question, key);
        return { id: result.lastInsertRowid };
    });
    ipcMain.handle('delete-report-export-question', (event, { reportId, questionId }) => {
        const stmt = db.prepare('DELETE FROM report_export_questions WHERE id = ? AND report_id = ?');
        const result = stmt.run(questionId, reportId);
        return { changes: result.changes };
    });
    ipcMain.handle('update-report-export-question', (event, { reportId, questionId, question_type, question, key }) => {
        const stmt = db.prepare('UPDATE report_export_questions SET question_type = ?, question = ?, key = ? WHERE id = ? AND report_id = ?');
        const result = stmt.run(question_type, question, key, questionId, reportId);
        return { changes: result.changes };
    });
}

function configureSectionIpcHandlers() {
    // Section-related IPC handlers
    ipcMain.handle('get-sections', (event, reportId) => {
        const stmt = db.prepare('SELECT * FROM report_sections WHERE report_id = ?');
        return stmt.all(reportId);
    });
    ipcMain.handle('add-section', (event, { reportId, sectionTitle, sectionType }) => {
        const stmt = db.prepare('INSERT INTO report_sections (report_id, title, type) VALUES (?, ?, ?)');
        const result = stmt.run(reportId, sectionTitle, sectionType);
        return { id: result.lastInsertRowid };
    });
    ipcMain.handle('delete-section', (event, { reportId, sectionId }) => {
        const stmt = db.prepare('DELETE FROM report_sections WHERE id = ? AND report_id = ?');
        const result = stmt.run(sectionId, reportId);
        return { changes: result.changes };
    });
    ipcMain.handle('update-section', (event, { reportId, sectionId, sectionValue }) => {
        const stmt = db.prepare('UPDATE report_sections SET value = ? WHERE id = ? AND report_id = ?');
        const result = stmt.run(sectionValue, sectionId, reportId);
        return { changes: result.changes };
    });
}

function configureReportEntryIpcHandlers() {
    ipcMain.handle('get-completed-reports', (event, patientId) => {
        const stmt = db.prepare('SELECT * FROM completed_reports WHERE patient_id = ? ORDER BY date_completed DESC');
        return stmt.all(patientId);
    });
    ipcMain.handle('get-completed-reports-by-report-id', (event, patientId, reportId) => {
        const stmt = db.prepare('SELECT * FROM completed_reports WHERE patient_id = ? AND report_id = ? ORDER BY date_completed DESC');
        return stmt.all(patientId, reportId);
    });
    ipcMain.handle('add-completed-report', (event, { reportId, patientId }) => {
        const stmt = db.prepare('INSERT INTO completed_reports (report_id, patient_id) VALUES (?, ?)');
        const result = stmt.run(reportId, patientId);
        return { id: result.lastInsertRowid };
    });
    ipcMain.handle('delete-completed-report', (event, { completedReportId }) => {
        const stmt = db.prepare('DELETE FROM completed_reports WHERE id = ?');
        const result = stmt.run(completedReportId);
        return { changes: result.changes };
    });


    // Report entry-related IPC handlers
    ipcMain.handle('get-report-entries', (event, completedReportId) => {
        const stmt = db.prepare('SELECT * FROM report_entries WHERE completed_report_id = ?');
        return stmt.all(completedReportId);
    });
    ipcMain.handle('add-report-entry', (event, { completedReportId, label, value, section_type }) => {
        const stmt = db.prepare('INSERT INTO report_entries (completed_report_id, label, value, section_type) VALUES (?, ?, ?, ?)');
        const result = stmt.run(completedReportId, label, value, section_type);
        return { id: result.lastInsertRowid };
    });
    ipcMain.handle('delete-report-entry', (event, { entryId }) => {
        const stmt = db.prepare('DELETE FROM report_entries WHERE id = ?');
        const result = stmt.run(entryId);
        return { changes: result.changes };
    });
    ipcMain.handle('update-report-entry', (event, { entryId, value, section_type }) => {
        const stmt = db.prepare('UPDATE report_entries SET value = ?, section_type = ? WHERE id = ?');
        const result = stmt.run(value, section_type, entryId);
        return { changes: result.changes };
    });
}

function configureIpcHandlers() {
    configurePatientIpcHandlers();
    configureReportIpcHandlers();
    configureReportExportQuestionIpcHandlers();
    configureSectionIpcHandlers();
    configureReportEntryIpcHandlers();
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    mainWindow.loadFile(path.join(__dirname, 'dist', 'nurses-notes', 'browser', 'index.html'));
    // mainWindow.loadURL('http://localhost:4200');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.setAppUserModelId("net.willc-dev.NursesNotes.NursesNotes");

app.whenReady().then(async () => {
    await initializePuppeteer();
    ensureDbTablesCreated();
    configureIpcHandlers();
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        db.close();
        app.quit();
    }
});

app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        await initializePuppeteer();
        ensureDbTablesCreated();
        configureIpcHandlers();
        createWindow();
    }
});