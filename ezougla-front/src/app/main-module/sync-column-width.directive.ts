import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
    selector: '[appSyncColumnWidth]'
})
export class SyncColumnWidthDirective {
    @Input('appSyncColumnWidth') columnIndex!: number;

    constructor(private el: ElementRef, private renderer: Renderer2) { }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        event.preventDefault();

        const startX = event.pageX;
        const startWidth = this.el.nativeElement.offsetWidth;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const diff = moveEvent.pageX - startX;
            const newWidth = startWidth + diff;

            const cells = document.querySelectorAll(`[data-col="${this.columnIndex}"]`);
            cells.forEach((cell: Element) => {
                (cell as HTMLElement).style.width = `${newWidth}px`;
            });
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
}