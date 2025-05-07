import { Controller, Get, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';
import * as fs from 'fs';

@Controller('uploads')
export class UploadController {
  @Get('*')
  async serveImage(@Req() req: Request, @Res() res: Response) {
    const filePath = req.params[0];
    
    if (filePath.includes('..')) {
      return res.status(400).json({ message: 'Invalid path' });
    }

    const absolutePath = join(process.cwd(), 'uploads', filePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    return res.sendFile(absolutePath);
  }
}
