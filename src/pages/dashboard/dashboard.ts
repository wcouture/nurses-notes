import { Component, inject, signal, viewChild } from '@angular/core';
import { ThemeMode } from '../../models/Theme';
import { PatientPanel } from '../../components/patient-panel/patient-panel';
import { PatientDetail } from '../../components/patient-detail/patient-detail';
import { ThemeManager } from '../../services/theme-manager/theme-manager';

@Component({
  imports: [PatientPanel, PatientDetail],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly title = signal('nurses-notes');
  readonly patientPanel = viewChild<PatientPanel>('panel');
  readonly patientDetail = viewChild<PatientDetail>('detail');
  protected panelVisible = signal(true);

  themeManager = inject(ThemeManager);
  theme = signal("");

  ngOnInit() {
    const currentTheme = this.themeManager.getTheme();
    const themeString = currentTheme === ThemeMode.Dark ? 'dark' : 'light';
    this.theme.set(themeString);

    this.themeManager.subscribe((theme) => {
      const themeString = theme === ThemeMode.Dark ? 'dark' : 'light';
      this.theme.set(themeString);
    });
  }

  onSelectedPatientChanged(patientId: number) {
    const detail = this.patientDetail()
    if (detail)
      detail.updateSelectedPatient(patientId);
    else
      console.warn('PatientDetail component is not available.');
  }

  onTogglePanel(visible: boolean) {
    const panel = this.patientPanel();
    if (panel) {
      this.panelVisible.set(visible);    
    } else {
      console.warn('PatientPanel component is not available.');
    }
  }
}
