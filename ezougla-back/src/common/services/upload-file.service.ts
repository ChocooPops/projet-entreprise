import { Injectable } from "@nestjs/common";
import * as path from 'path';
import * as fs from 'fs-extra';

@Injectable({})
export class UploadFileService {

    private readonly folderUploads: string = 'uploads';
    private readonly folderUser: string = 'user';
    private readonly folderProjects: string = 'projects';
    private readonly folderFile: string = 'file';
   
    public getBaseName(pathUrl: string | null): string | null {
        if (pathUrl) {
            return path.basename(pathUrl);
        } else {
            return null;
        }
    }

    public getExtensionFromFilename(filename: string): string | null {
        const parts = filename.split('.');
        if (parts.length < 2) return 'null';
        return parts.pop()?.toLowerCase() || 'null';
    }

    public getImageExtensionFromUrl(image: string): string {
        return path.extname(image).toLowerCase();
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        const binary = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
        return window.btoa(binary);
    }

    public isBase64Image(str: string | ArrayBuffer): boolean {
        if (str instanceof ArrayBuffer) {
            str = this.arrayBufferToBase64(str);
        }

        return typeof str === 'string' &&
            /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(str);
    }

    private async saveFile(base64: string, directory: string, filename: string): Promise<any> {
        if (!base64 || !filename) {
            throw new Error('base64 ou filename manquant');
        }
        
        const matches = base64.match(/^data:(.+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error('Format base64 invalide');
        }
        const buffer = Buffer.from(matches[2], 'base64');
        const projectRoot = process.cwd();
        const uploadsDir = path.join(projectRoot, directory);
        
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const extension = path.extname(filename);
        const baseName = path.basename(filename, extension);
        const savedFileName = `${baseName}-${Date.now()}${extension}`;
        const fullPath = path.join(uploadsDir, savedFileName);
        fs.writeFileSync(fullPath, buffer);
        
        const relativePath = path.relative(projectRoot, fullPath);
        return relativePath;
    }

    public async saveFileToUser(image: string, filename: string): Promise<any> {
        const directoryPath = path.join(this.folderUploads, this.folderUser);
        return await this.saveFile(image, directoryPath, filename);
    }

    public async saveFileToProjects(image: string, filename: string): Promise<any> {
        const directoryPath = path.join(this.folderUploads, this.folderProjects);
        return await this.saveFile(image, directoryPath, filename);
    }

    public async saveFiletoFile(file: string, filename: string): Promise<string> {
        const directoryPath = path.join(this.folderUploads, this.folderFile);
        return this.saveFile(file, directoryPath, filename);
    }

    public async deleteFileOrFolder(directory: string): Promise<boolean> {
        try {
            const filePath = path.join(process.cwd(), directory);
        
            if (!fs.existsSync(filePath)) {
              return true;
            }
        
            fs.unlinkSync(filePath);
        
            return true;
          } catch (error) {
            return false;
        }
    }

}