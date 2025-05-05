import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from '../menu/menu.component';


@Component({
  selector: 'app-main-page',
  imports: [RouterOutlet, MenuComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {
  isResizing = false;

  onMouseDown(event: MouseEvent) {
    this.isResizing = true;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizing) return;

    const container = document.querySelector('.container') as HTMLElement;
    const left = document.querySelector('.left') as HTMLElement;
    const containerOffsetLeft = container.offsetLeft;
    const pointerRelativeXpos = event.clientX - containerOffsetLeft;
    const newLeftWidth = (pointerRelativeXpos / container.clientWidth) * 100;

    left.style.width = `${newLeftWidth}%`;
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isResizing = false;
  }
}
