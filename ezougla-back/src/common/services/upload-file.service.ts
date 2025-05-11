import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import * as path from 'path';
import * as fs from 'fs-extra';
import { Buffer } from 'buffer';
import * as pdf from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';
import * as XLSX from 'xlsx';
import * as csvParser from 'csv-parser';

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
        return await this.saveFile(file, directoryPath, filename);
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

    async extractAllTextFromBase64(fileName: string, base64: string, throwError: boolean): Promise<string> {
        const extension: string = this.getExtensionFromFilename(fileName);
        if (extension === 'pdf') {
            return await this.extractPdfFromBase64(base64);
        } else if (extension === 'docx') {
            return await this.extractTextFromDocxBase64(base64);
        } else if (extension === 'odt') {
            return await this.extractTextFromOdtBase64(base64);
        } else if (extension === 'txt') {
            return await this.extractTextFromBase64(base64);
        } else if (throwError) {
            throw new UnprocessableEntityException("Les informations sont impossibles à extraire, le problème vient surement de l'extension de votre fichier : " + extension);
        } else {
            return ''
        }
    }

    async extractPdfFromBase64(base64: string): Promise<string | null> {
        if (base64.startsWith('data:application/pdf;base64,')) {
            base64 = base64.replace(/^data:application\/pdf;base64,/, '');
        }
        const buffer = Buffer.from(base64, 'base64');
        const data = await pdf(buffer);
        const text = data.text;
        const cleanedText = text
            .split(/\n\s*\n/)
            .map(p => p.trim())
            .filter(p => p.length > 0)
            .join('\n\n');

        return cleanedText;
    }

    async extractTextFromDocxBase64(base64: string): Promise<string> {
        if (base64.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,')) {
            base64 = base64.replace(/^data:application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document;base64,/, '');
        }
        const buffer = Buffer.from(base64, 'base64');
        const result = await mammoth.extractRawText({ buffer });
        return result.value.trim();
    }

    async extractTextFromOdtBase64(base64: string): Promise<string> {

        if (base64.startsWith('data:application/vnd.oasis.opendocument.text;base64,')) {
            base64 = base64.replace(/^data:application\/vnd\.oasis\.opendocument\.text;base64,/, '');
        }

        const buffer = Buffer.from(base64, 'base64');
        const zip = new AdmZip(buffer);

        const entry = zip.getEntry('content.xml');
        if (!entry) throw new Error('Le fichier .odt ne contient pas de content.xml');

        const xmlContent = entry.getData().toString('utf-8');

        const parser = new XMLParser({
            ignoreAttributes: false,
            removeNSPrefix: true,
            textNodeName: 'text',
        });

        const parsed = parser.parse(xmlContent);

        const flatText = this.flattenText(parsed);

        return flatText.trim();
    }

    private flattenText(obj: any): string {
        let result = '';
        function recurse(o: any) {
            if (typeof o === 'string') {
                result += o + ' ';
            } else if (typeof o === 'object') {
                for (const key in o) {
                    recurse(o[key]);
                }
            }
        }
        recurse(obj);
        return result;
    }

    public extractTextFromBase64(base64Data: string): string {
        const decodedData = Buffer.from(base64Data, 'base64').toString('utf-8');
        return decodedData;
    }

}
