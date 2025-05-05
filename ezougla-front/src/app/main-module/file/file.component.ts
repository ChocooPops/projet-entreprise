import { Component, Input } from '@angular/core';
import { FileModel } from '../../model/file.interface';

@Component({
  selector: 'app-file',
  imports: [],
  templateUrl: './file.component.html',
  styleUrl: './file.component.css'
})
export class FileComponent {

  @Input() file !: FileModel

  ngOnInit(): void {

  }

  detectFileType(filename: string) {
    const fileTypes = {
      document: ['.doc', '.docx', '.odt', '.txt', '.rtf', '.pdf'],
      spreadsheet: ['.xls', '.xlsx', '.ods', '.csv'],
      image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
      other: []
    };

    const extension = filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();

    for (let [type, extensions] of Object.entries(fileTypes)) {
      if (extensions.some(ext => extension === ext.slice(1))) {
        return type;
      }
    }
    return 'other';
  }
}
