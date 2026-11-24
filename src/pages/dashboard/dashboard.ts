import { Component, signal, viewChild } from '@angular/core';
import { PatientPanel } from '../../components/patient-panel/patient-panel';
import { PatientDetail } from '../../components/patient-detail/patient-detail';

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
