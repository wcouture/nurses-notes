import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  imports: [],
  selector: 'report-section-input',
  styleUrl: './report-section-input.css',
  templateUrl: './report-section-input.html',
})
export class ReportSectionInput {
  sectionTitle = new FormControl('');
  sectionInputType = new FormControl(0);

  public getSectionTitle() {
    return this.sectionTitle.value;
  }
  public getSectionInputType() {
    return this.sectionInputType.value;
  }
}
