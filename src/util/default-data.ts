import { ReportScope, SectionType } from '../models/Report';

const defaultReports = [
    {
      title: 'Timesheet',
      scope: ReportScope.Patient,
      templateFilePath: 'report_templates/skilled-timesheet.html', 
      templateFileName: 'skilled-timesheet.html',
      fields: [
        {title: 'Day & Date', type: SectionType.Date},
        {title: 'Start', type: SectionType.ShortText},
        {title: 'End', type: SectionType.ShortText},
        {title: 'Total', type: SectionType.Number},
        {title: 'Notes', type: SectionType.LongText},
      ],
      exportQuestions: [
        {type: SectionType.Date, question: 'Week Ending Date', key: 'WEEK_ENDING_DATE'},
        {type: SectionType.ShortText, question: 'Service performed', key: 'CLIENT_SERVICE'},
        {type: SectionType.Number, question: 'Total mileage travelled', key: 'CLIENT_MILEAGE'}
      ]
    },
    {
      title: 'Notes',
      scope: ReportScope.Patient,
      templateFilePath: 'report_templates/daily-notes.html',
      templateFileName: 'daily-notes.html',
      fields: [
        {title: 'Date', type: SectionType.Date},
        {title: 'Notes', type: SectionType.LongText},
      ],
      exportQuestions: []
    },
    {
      title: 'Mileage Reimbursement',
      scope: ReportScope.User,
      templateFilePath: 'report_templates/mileage-tracker.html',
      templateFileName: 'mileage-tracker.html',
      fields: [
        {title: 'Date', type: SectionType.Date},
        {title: 'Reason for Travel', type: SectionType.ShortText},
        {title: 'Start Location', type: SectionType.ShortText},
        {title: 'End Location', type: SectionType.ShortText},
        {title: 'Miles Traveled', type: SectionType.Number},
      ],
      exportQuestions: [
        {type: SectionType.Date, question: 'Expense Period Begin Date', key: 'EXPENSE_PERIOD_FROM'},
        {type: SectionType.ShortText, question: 'Expense Period End Date', key: 'EXPENSE_PERIOD_TO'},
        {type: SectionType.Number, question: 'Mileage rate', key: 'MILEAGE_RATE'},
        {type: SectionType.LongText, question: 'Comments', key: 'COMMENTS'}
      ]
    }
];

export default defaultReports;