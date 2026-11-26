# Nurses Notes

Nurses Notes is a desktop application for managing patients and producing nursing, time, mileage, and other work reports. It combines a configurable Angular interface with Electron's desktop and file capabilities, stores data locally in SQLite, and exports report entries to PDF using report-specific HTML templates.

The app supports reusable report definitions, customizable entry sections, complete report tracking, patient and employee context, template placeholders, numeric totals, and automatic download of generated PDF files.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Desktop shell | Electron 45 |
| Desktop packaging | Electron Forge 8, Squirrel for Windows, DMG for macOS |
| Frontend framework | Angular 22 |
| Application language | TypeScript 6 |
| UI primitives | Angular standalone components, reactive forms, RxJS |
| Local database | SQLite through Node.js `node:sqlite` |
| PDF generation | Puppeteer with Chromium and Puppeteer `Page.pdf()` |
| Testing | Angular unit-test builder with Vitest |
| Styling | Plain CSS |
| Package manager | npm |
| Releases | GitHub Actions and Electron Forge GitHub publisher |

### Architecture

- `src/` contains the Angular application, components, pages, models, pipes, and services.
- `main.js` is the Electron main-process entry point. It creates the desktop window, initializes Puppeteer, opens the SQLite database, and implements IPC handlers.
- `preload.js` exposes a restricted `window.electronAPI` API to the Angular renderer through Electron context isolation.
- Angular communicates with Electron by invoking named IPC channels instead of directly accessing Node.js or SQLite APIs.
- `nurses-notes.db` is the local SQLite database file.
- `public/report_templates/` contains the included HTML report templates.
- `assets/` contains installer artwork.
- `public/` contains application images and other packaged static assets.
- Electron loads the production Angular build from `dist/nurses-notes/browser/index.html`.

This separation keeps file and database operations in the Electron main process while the Angular renderer remains responsible for forms, report configuration, selection, and export presentation.

## App Capabilities

### Patient management

- Create patient records with name, birth date, address, city/state/ZIP, email, and phone number.
- Edit existing patient information.
- Delete patient records.
- Maintain a separate user/employee record for the nurse or employee completing reports.
- Associate completed reports with a patient or use an employee-level scope for reports such as mileage reimbursement.

### Customizable reports

Reports can be created and managed from the Admin page. A report has:

- A title.
- A scope:
  - **Patient** reports are associated with a patient.
  - **User** reports belong to the employee/user record.
- A reusable entry table made up of report sections.
- An attached HTML template used during PDF export.
- Optional export questions for values that need to be included outside the entry table.

Sections support these input types:

- Short text
- Long text
- Number
- Checkbox
- Radio buttons
- Date

Administrators can add, edit, or remove report sections and export questions. Export questions each have a display label and a template key, allowing template authors to place report-level values such as a week-ending date, mileage rate, service performed, or comments.

The app includes three default report types:

- **Timesheet**: weekly work entries with day/date, start, end, total, and notes.
- **Notes**: patient-specific dated nursing notes.
- **Mileage Reimbursement**: travel entries with date, purpose, start location, end location, and miles.

### Complete and track report entries

- Start a completed report from an existing report definition.
- Enter values for each report section.
- Store entries against the completed report and the associated patient.
- Track the completion date of each report.
- View saved completed reports and their entries.
- Edit or delete report entries.
- Delete completed report records.
- Select a subset of completed reports when preparing an export.

Report data is stored locally, not in a remote service. Each completed report keeps its associated report, patient, date, and individual section values.

### PDF export

Export combines selected completed entries with an attached HTML template and downloads a PDF:

1. Choose the report and patient.
2. Answer any report export questions.
3. Select the completed report entries to include.
4. The app loads the report's attached HTML template.
5. Report sections become the generated table columns.
6. Selected completed reports become table rows.
7. Template placeholders are replaced with patient, employee, question, date, image, and calculated values.
8. Puppeteer renders the final HTML and creates a Letter-size PDF.
9. The browser downloads the PDF as `<report title>.pdf`.

PDF rendering:

- Uses letter paper.
- Prints backgrounds.
- Has top and bottom margins set to `0px` by the current renderer.
- Runs Chromium in headless mode.

## HTML Report Templates

Templates are HTML files attached to a report and stored in the SQLite database. The current built-in templates are:

- `public/report_templates/daily-notes.html`
- `public/report_templates/mileage-tracker.html`
- `public/report_templates/skilled-timesheet.html`

A template must include `{{CONTENT}}` exactly once. The report builder replaces this placeholder with the generated `<tr>` header and entry rows.

### Standard placeholders

| Placeholder | Replacement |
| --- | --- |
| `{{CONTENT}}` | Generated report table header and rows |
| `{{CURRENT_DATE}}` | Current local date |
| `{{BRIGHTSTAR_LOGO}}` | BrightStar Care logo image |
| `{{SIGNATURE}}` | Signature image |

### Employee/user placeholders

| Placeholder | Replacement |
| --- | --- |
| `{{USER_NAME}}` | Employee name |
| `{{USER_DOB}}` | Employee birth date |
| `{{USER_ADDRESS}}` | Employee street address |
| `{{USER_CITY_STATE_ZIP}}` | Employee city/state/ZIP |
| `{{USER_PHONE}}` | Employee phone |

### Patient/client placeholders

| Placeholder | Replacement |
| --- | --- |
| `{{PATIENT_NAME}}` | Patient name |
| `{{PATIENT_DOB}}` | Patient birth date |
| `{{PATIENT_ADDRESS}}` | Patient street address |
| `{{PATIENT_CITY_STATE_ZIP}}` | Patient city/state/ZIP |
| `{{PATIENT_PHONE}}` | Patient phone |

Custom export questions are inserted using their configured key:

```html
<p>Week ending: {{WEEK_ENDING_DATE}}</p>
<p>Service: {{CLIENT_SERVICE}}</p>
```

Numeric report sections are also available as summed totals. The placeholder name is derived from the section label:

```text
"Miles Traveled" -> {{TOTAL_MILES_TRAVELED}}
"Total"          -> {{TOTAL_TOTAL}}
```

The generated value is formatted with two decimal places.

When editing or creating a report, upload a complete HTML template. Templates can define their own print layout, styles, headers, footers, signatures, and calculated fields.

## Local Database

The application uses `nurses-notes.db` in the working directory. The Electron main process creates the following tables if they do not already exist:

| Table | Purpose |
| --- | --- |
| `patients` | Patient and employee/user records |
| `reports` | Report definitions, scopes, and attached template files |
| `report_sections` | Column definitions for report entry tables |
| `report_export_questions` | Report-level export fields and template keys |
| `completed_reports` | A completed report associated with a report and patient |
| `report_entries` | Section values belonging to a completed report |

Templates are stored in `reports.template_file` as binary data. Template filenames are retained in `reports.template_file_name`.

Because database operations are IPC-mediated and SQLite is local, back up `nurses-notes.db` before moving or reinstalling the application if preserving the existing records is important.

## Getting Started

### Prerequisites

- Git
- Node.js 24 or a compatible Electron-supported Node runtime
- npm
- Platform build tools required by Electron Forge when creating native installers

Install JavaScript dependencies:

```bash
npm ci
```

### Run the desktop app

Build the Angular application and start Electron Forge:

```bash
npm run build
npm start
```

The Forge start command packages the Electron shell using the Angular build in `dist/nurses-notes/browser/`.

To work on Angular renderer code with live browser reload, run:

```bash
npm start
```

For renderer-only browser development:

```bash
npx ng serve
```

Angular serves the browser app at `http://localhost:4200/`. Electron features such as SQLite IPC and PDF generation require the Electron desktop process and are not provided by the standalone Angular development server.

## Development Commands

| Command | Purpose |
| --- | --- |
| `npm start` | Start the application through Electron Forge |
| `npm run build` | Create the production Angular build |
| `npx ng serve` | Run the Angular renderer in a browser development server |
| `npx ng test` | Run Angular unit tests with Vitest |
| `npm run package` | Package the desktop app for the current platform |
| `npm run make` | Create installer/distribution artifacts |
| `npm run publish` | Publish artifacts through the configured GitHub publisher |

### Angular scaffolding

Generate a component with the Angular CLI:

```bash
npx ng generate component component-name
```

List available scaffolding schematics:

```bash
npx ng generate --help
```

## Packaging and Releases

Electron Forge is configured with:

- Squirrel installer for Windows.
- DMG installer for macOS.
- A GitHub release publisher for `wcouture/nurses-notes`.
- Application icons from `public/nurses-notes`.
- Installer artwork from `assets/loading.gif` and `assets/background.jpg`.

Create local platform artifacts:

```bash
npm run package
npm run make
```

GitHub Actions builds macOS and Windows artifacts when:

- A tag matching `v*` is pushed.
- The release workflow is started manually with `workflow_dispatch`.

The workflow runs `npm ci`, `npm run build`, and `npm run publish` using `GITHUB_TOKEN`.

## Project Structure

```text
.
├── src/
│   ├── app/                  # Root component, routes, and app configuration
│   ├── components/           # Patient, report, entry, and modal components
│   ├── models/               # Patient, report, section, and entry types
│   ├── pages/                # Dashboard and admin pages
│   ├── pipes/                # Date, report scope, and section type formatting
│   ├── services/             # IPC service wrappers and PDF report builder
│   └── util/                 # Default report definitions
├── public/
│   ├── report_templates/     # Built-in HTML templates
│   └── ...                   # Icons and application images
├── assets/                   # Installer background and loading artwork
├── main.js                   # Electron main process and SQLite handlers
├── preload.js                # Context-isolated Electron IPC bridge
├── nurses-notes.db           # Local SQLite database
└── .github/workflows/         # macOS and Windows release workflow
```
