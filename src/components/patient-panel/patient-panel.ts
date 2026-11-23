import { Component, output, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PatientService } from '../../services/patient-service/patient-service';
import { Patient } from '../../models/Patient';
import { ReactiveFormsModule } from '@angular/forms';
import { IconImage } from '../../models/IconImage';
import { Icon } from '../icon/icon';

@Component({
  imports: [ReactiveFormsModule, RouterLink, Icon],
  selector: 'patient-panel',
  styleUrls: ['./patient-panel.css'],
  templateUrl: './patient-panel.html',
})
export class PatientPanel {
  IconImage = IconImage;

  patientService = inject(PatientService);

  panelVisible = signal<boolean>(true);
  panelToggleIcon: string = '<<';
  
  user = signal<Patient | undefined>(undefined);
  patientList = signal<Patient[]>([]);
  selectedPatient: number | null = null;

  onSelectedPatientChanged = output<number>();
  onTogglePanel = output<boolean>();

  async ngOnInit(): Promise<void> {
    const p = await this.patientService.getPatientList();
    this.patientList.set(p ?? []);
    const u = await this.patientService.getUser();
    this.user.set(u);
  }

  onSelectPatient(patientId: number) {
    this.selectedPatient = patientId;
    this.onSelectedPatientChanged.emit(patientId);
  }

  togglePanelVisibility() {
    this.panelVisible.set(!this.panelVisible());
    this.panelToggleIcon = this.panelVisible() ? '<<' : '>>';
    this.onTogglePanel.emit(this.panelVisible());
  }

}
