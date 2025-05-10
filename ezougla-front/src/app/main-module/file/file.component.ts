import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FileModel } from '../../model/file.interface';
import { NgClass } from '@angular/common';
import { FileService } from '../../services/file/file.service';
import { take } from 'rxjs';
import { CreateFileModel } from '../../model/create-file.interface';

@Component({
  selector: 'app-file',
  imports: [NgClass],
  templateUrl: './file.component.html',
  styleUrl: './file.component.css'
})
export class FileComponent {

  @Input() file !: FileModel

  @Input() createFile !: CreateFileModel;

  @Input() displayDeleteButton: boolean = true;

  @Output() emitRemoveFile = new EventEmitter<FileModel>();

  @Output() emitRemoveCreateFile = new EventEmitter<string>();

  srcImage !: string;
  type: string = '';

  srcButtonApercu: string = './apercu.png';
  srcButtonDowload: string = './download.png';
  srcButtonDelete: string = './poubelle.png';
  srcNewFile: string = './new-file.png';

  constructor(private fileService: FileService) { }

  ngOnInit(): void {
    if (this.file) {
      this.type = this.detectFileType(this.file.type);
      if (this.type === 'document') {
        this.srcImage = './docs.png';
      } else if (this.type === 'spreadsheet') {
        this.srcImage = './xls.png';
      } else if (this.type === 'image') {
        this.srcImage = './picture.png';
      } else if (this.type === 'pdf') {
        this.srcImage = './pdf.png';
      } else {
        this.srcImage = './other.png';
      }
    }

    if (this.createFile) {
      const extractExtansion: string[] = this.createFile.name.split('.');
      const extension: string = extractExtansion[extractExtansion.length - 1];
      this.type = this.detectFileType(extension);
      if (this.type === 'document') {
        this.srcImage = './docs.png';
      } else if (this.type === 'spreadsheet') {
        this.srcImage = './xls.png';
      } else if (this.type === 'image') {
        this.srcImage = './picture.png';
      } else if (this.type === 'pdf') {
        this.srcImage = './pdf.png';
      } else {
        this.srcImage = './other.png';
      }
    }
  }

  detectFileType(type: string): string {
    const fileTypes = {
      document: ['doc', 'docx', 'odt', 'txt', 'rtf'],
      pdf: ['pdf'],
      spreadsheet: ['xls', 'xlsx', 'ods', 'csv'],
      image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'],
      other: []
    };

    if (fileTypes.document.find((item) => item === type)) {
      return 'document';
    } else if (fileTypes.pdf.find((item) => item === type)) {
      return 'pdf';
    } else if (fileTypes.spreadsheet.find((item) => item === type)) {
      return 'spreadsheet';
    } else if (fileTypes.image.find((item) => item === type)) {
      return 'image';
    } else {
      return 'other';
    }
  }

  onClickDelete(): void {
    this.fileService.fetchDeleteFile(this.file.id).pipe(take(1)).subscribe((data) => {
      this.emitRemoveFile.emit(data)
    });
  }

  onClickRemoveCreateFile(): void {
    this.emitRemoveCreateFile.emit(this.createFile.idProjects);
  }

  onClickApercu(): void {
    this.fileService.fetchApercu(this.file.url);
  }

  onClickDownload(): void {
    this.fileService.fetchDownloadFile(this.file.url, this.file.name);
  }

}
