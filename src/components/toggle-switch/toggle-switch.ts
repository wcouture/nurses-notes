import { input, output, Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'toggle-switch',
  styleUrl: './toggle-switch.css',
  templateUrl: './toggle-switch.html',
})
export class ToggleSwitch {
  onToggleCallback = output<string>();

  option1 = input<string>("Option 1");
  option2 = input<string>("Option 2");

  option1Color = input<string>("#4caf50");
  option2Color = input<string>("#f44336");

  selectedOption = signal<number>(0);

  toggle() {
    this.selectedOption.set(this.selectedOption() === 0 ? 1 : 0);
    this.onToggleCallback.emit(this.selectedOption() === 0 ? this.option1() : this.option2());
  }
}
