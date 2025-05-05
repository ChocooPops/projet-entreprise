import { Injectable } from "@nestjs/common";
import * as path from 'path';
import * as fs from 'fs-extra';

@Injectable({})
export class UploadImageService {

    private readonly folderUploads: string = 'uploads';
    private readonly folderUser: string = 'user';
    private readonly folderProjects: string = 'projects';
    private readonly folderFile: string = 'file';
    private readonly uploadDirToUser = path.join(`${this.folderUploads}/${this.folderUser}`);
    private readonly uploadDirToProjects = path.join(`${this.folderUploads}/${this.folderProjects}`);
    private readonly uploadDirToFile = path.join(`${this.folderUploads}/${this.folderFile}`);

    public getBaseName(pathUrl: string | null): string | null {
        if (pathUrl) {
            return path.basename(pathUrl);
        } else {
            return null;
        }
    }

    public getImageExtensionFromBase64(image: string | ArrayBuffer): string | null {
        let base64: string;

        if (image instanceof ArrayBuffer) {
            base64 = this.arrayBufferToBase64(image);
        } else {
            base64 = image;
        }

        const match = base64.match(/^data:image\/([a-zA-Z]+);base64,/);
        return match ? match[1] : null;
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

    private async saveImage(image: string | ArrayBuffer, directory: string, filename: string): Promise<any> {
        try {
            const filePath = path.join(directory, filename);
            let imageBuffer: Buffer;
            if (image instanceof ArrayBuffer) {
                imageBuffer = Buffer.from(image);
            } else if (typeof image === 'string') {
                if (image.startsWith('data:image')) {
                    const matches = image.match(/^data:image\/([a-zA-Z]*);base64,([^\"]*)$/);
                    if (matches && matches[2]) {
                        imageBuffer = Buffer.from(matches[2], 'base64');
                    } else {
                        throw new Error('Format d\'image incorrect');
                    }
                } else {
                    imageBuffer = Buffer.from(image, 'base64');
                }
            } else {
                throw new Error('Type d\'image non supporté');
            }
            await fs.ensureDir(directory);
            await fs.writeFile(filePath, imageBuffer);

            return {
                id: 0,
                state: true,
                message: `Image enregistrée à : ${filePath}`
            };
        } catch (error) {
            return {
                id: -1,
                state: false,
                message: 'Erreur lors de l\'enregistrement de l\'image : ' + error.message
            };
        }
    }

    public async saveImageToUser(image: string | ArrayBuffer, directory: string, filename: string): Promise<any> {
        const directoryPath = path.join(`${this.uploadDirToUser}`, directory);
        return await this.saveImage(image, directoryPath, filename);
    }

    public async saveImageToProjects(image: string | ArrayBuffer, directory: string, filename: string): Promise<any> {
        const directoryPath = path.join(`${this.uploadDirToProjects}`, directory);
        return await this.saveImage(image, directoryPath, filename);
    }

    private async deleteFileOrFolder(path: string): Promise<any> {
        try {
            if (await fs.pathExists(path)) {
                await fs.remove(path);
                return {
                    id: 0,
                    state: true,
                    message: `Succès de la Suppression du fichier : ${path}`
                }
            } else {
                return {
                    id: 0,
                    state: true,
                    message: `Erreur : Le fichier ou dossier "${path}" n'existe pas.`
                }
            }
        } catch (error) {
            return {
                id: 0,
                state: true,
                message: `Erreur lors de la suppression de "${path}": ${error.message}`
            }
        }
    }

    public async deleteFileOrDirectoryToUser(directory: string): Promise<any> {
        const pathDirecotry = path.join(`${this.uploadDirToUser}/${directory}`);
        return this.deleteFileOrFolder(pathDirecotry);
    }

    public async deleteFileOrDirectoryToProjects(directory: string): Promise<any> {
        const pathDirecotry = path.join(`${this.uploadDirToProjects}/${directory}`);
        return this.deleteFileOrFolder(pathDirecotry);
    }
}