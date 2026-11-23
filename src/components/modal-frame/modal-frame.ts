import { Component, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'modal-frame',
  styleUrl: './modal-frame.css',
  templateUrl: './modal-frame.html',
})
export class ModalFrame {
  clickCaughtEvent = output<void>();

  private onClickCaught(event: Event) {
    const element = event.target as HTMLElement;
    if (element && element.classList.contains("click-catcher")) {
      this.clickCaughtEvent.emit()
    }
  }
}
