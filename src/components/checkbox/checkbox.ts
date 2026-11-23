import { Component, signal, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'checkbox',
  styleUrl: './checkbox.css',
  templateUrl: './checkbox.html',
})
export class Checkbox {
  name = input<string>('');
  checked = signal(false);

  toggle() {
    this.checked.set(!this.checked());
  }
}
