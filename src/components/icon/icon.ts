import { Component, input } from '@angular/core';
import { IconImage } from '../../models/IconImage';

@Component({
  imports: [],
  selector: 'icon',
  styleUrl: './icon.css',
  templateUrl: './icon.html',
})
export class Icon {
  iconImage = input<IconImage>();
  size = input<number>(3);
  get sizeClass() {
    return `is-${this.size()}`;
  }
}
