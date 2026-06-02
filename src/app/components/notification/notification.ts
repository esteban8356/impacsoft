import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notification.html',
    styleUrls: ['./notification.scss']
})
export class NotificationComponent {
    @Input() title: string = '';
    @Input() message: string = '';
    @Input() type: 'success' | 'error' = 'success';
    @Output() close = new EventEmitter<void>();

    onClose() {
        this.close.emit();
    }
}
