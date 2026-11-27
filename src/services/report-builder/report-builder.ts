import { Service } from '@angular/core';
import { Patient } from '../../models/Patient';
import { ReportExportQuestion, Report, CompletedReport, SectionType } from '../../models/Report';

@Service()
export class ReportBuilder {
    private readonly DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // Builds export report for the given report, entries, and user information
    // Returns the final HTML content as a string
    public async buildReport(report: Report, entries: CompletedReport[], userInfo: Patient, patientInfo: Patient): Promise<string> {
        try {
            // Report attached template file
            const template_file = await report.getTemplateFile();
            const template_data = await template_file.text();
    
            const hasContentPlaceholder = template_data.includes("{{CONTENT}}");
            if (!hasContentPlaceholder) {
                throw new Error("Template is missing the {{CONTENT}} placeholder.");
            }
    
            const tableContent = await this.generateTable(report, entries);
            let finalHtmlContent = "";

            finalHtmlContent = template_data.replace("{{CONTENT}}", tableContent);
            finalHtmlContent = this.insertUserInfo(finalHtmlContent, userInfo);
            finalHtmlContent = this.insertPatientInfo(finalHtmlContent, patientInfo);
            finalHtmlContent = await this.insertBrightStarLogo(finalHtmlContent);
            finalHtmlContent = await this.insertSignature(finalHtmlContent);
            finalHtmlContent = await this.insertCurrentDate(finalHtmlContent);
            finalHtmlContent = this.insertExportQuestions(finalHtmlContent, report.export_questions ?? []);
            finalHtmlContent = this.calculateAndInsertSummedFields(finalHtmlContent, entries);

            return finalHtmlContent;
        } catch (error) {
            console.error("Error building report:", error);
            throw error;
        }
    }

    private insertCurrentDate(template: string): Promise<string> {
        const currentDate = new Date().toLocaleDateString();
        template = template.replaceAll("{{CURRENT_DATE}}", currentDate);
        return Promise.resolve(template);
    }

    private insertExportQuestions(template: string, exportQuestions: ReportExportQuestion[]): string {
        let result = template;
        for (const question of exportQuestions) {
            result = result.replaceAll(`{{${question.key}}}`, question.value ?? "");
        }
        return result;
    }

    private calculateAndInsertSummedFields(template: string, entries: CompletedReport[]): string {
        let result = template;
        let field_sums = {} as Record<string, number>;
        for (const entry of entries) {
            for (const e of entry.entries) {
                if (e.section_type === SectionType.Number) {
                    field_sums[e.label] = (field_sums[e.label] ?? 0) + (Number(e.value) || 0);
                }
            }
        }
        for (const field in field_sums) {
            let field_key = `TOTAL_${(field.replaceAll(" ", "_").toUpperCase())}`;
            let field_value = field_sums[field].toFixed(2);
            result = result.replaceAll(`{{${field_key}}}`, field_value);
        }
        return result;
    }


    private insertUserInfo(template: string, userInfo: Patient): string {
        let result = template;
        result = result.replaceAll("{{USER_NAME}}", userInfo.name ?? "");
        result = result.replaceAll("{{USER_DOB}}", userInfo.birthdate.toDateString() ?? "");
        result = result.replaceAll("{{USER_ADDRESS}}", userInfo.street_address ?? "");
        result = result.replaceAll("{{USER_CITY_STATE_ZIP}}", userInfo.city_state_zip ?? "");
        result = result.replaceAll("{{USER_PHONE}}", userInfo.phone ?? "");
        return result;
    }

    private insertPatientInfo(template: string, associatedPatient: Patient): string {
        let result = template;
        console.log("Inserting patient info for:", associatedPatient);
        result = result.replaceAll("{{PATIENT_NAME}}", associatedPatient.name ?? "");
        result = result.replaceAll("{{PATIENT_DOB}}", associatedPatient.birthdate.toDateString() ?? "");
        result = result.replaceAll("{{PATIENT_ADDRESS}}", associatedPatient.street_address ?? "");
        result = result.replaceAll("{{PATIENT_CITY_STATE_ZIP}}", associatedPatient.city_state_zip ?? "");
        result = result.replaceAll("{{PATIENT_PHONE}}", associatedPatient.phone ?? "");
        return result;
    }

    private async insertBrightStarLogo(template: string): Promise<string> {
        const logo_base64 = await this.getImageAsBase64("brightstar-logo.png")
        const logo_url = `data:image/png;base64,${logo_base64}`;
        return template.replace("{{BRIGHTSTAR_LOGO}}", `<img src="${logo_url}" alt="BrightStar Care: A Higher Standard" style="max-width: 100%; height: auto;" />`);
    }

    private async insertSignature(template: string): Promise<string> {
        const signature_base64 = await this.getImageAsBase64("signature.png");
        const signature_url = `data:image/png;base64,${signature_base64}`;
        return template.replace("{{SIGNATURE}}", `<img src="${signature_url}" alt="Signature" style="max-width: 100%; max-height: 50px; height: auto;" />`);
    }

    // Generates the HTML table for the report based on its sections and entries
    private async generateTable(report: Report, entries: CompletedReport[]): Promise<string> {
        const tableHeader = '<tr>' + report.sections.map(section => `<th>${section.title}</th>`).join('') + '</tr>';
        
        const tableRows = entries.map(entry => {
          let rowContent = '<tr>'; 
          for (const section of report.sections) {
            // Find the entry corresponding to the current section
            const sectionEntry = entry.entries.find(e => e.label === section.title && e.section_type === section.type);
            if (sectionEntry) {
                let cellClass = '';
                let cellValue = sectionEntry.value;
                switch (section.type) {
                    case SectionType.Number:
                        cellClass = 'number-cell';
                        break;
                    case SectionType.LongText:
                        cellClass = 'text-cell';
                        break;
                    case SectionType.Date:
                        cellValue = this.getDateString(sectionEntry.value);
                        cellClass = 'date-cell';
                        break;

                }
                rowContent += `<td class="${cellClass}">${cellValue}</td>`; 
            }
          }
          rowContent += '</tr>';
          return rowContent;
        });
        
        const tableContent = tableHeader + tableRows.join('');
        return tableContent;
    }

    private getDateString(dateVal: string): string {
        const parts = dateVal.split('-').map(Number);
        if (parts.length !== 3) {
            return '';
        }
        const date = new Date(parts[0], parts[1] - 1, parts[2]);

        const dayOfWeek = this.DAYS_OF_WEEK[date.getDay() - 1];
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        return `<strong>${dayOfWeek}</strong><br/>${month}/${day}/${year}`;
    }

    // Invokes IPC to generate a PDF from the provided HTML content
    public generatePDF(htmlContent: string): Promise<Uint8Array> {
        return window.electronAPI?.generatePDF(htmlContent) ?? Promise.resolve(new Uint8Array());
    }

    private async getImageAsBase64(url: string): Promise<string> {
        const response = await fetch(url);
        const blob = await response.blob();

        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        return base64;
    }
}
