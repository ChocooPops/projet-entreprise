import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MistralApiService {

    private apiUrl: string = 'https://api.mistral.ai/v1/chat/completions';
    private apiKey: string = 'RiumqLrpgYr6SUvXZgO8pX0TROSSo86X';

    constructor(private httpService: HttpService) { }

    async fetchSendQuestion(question: string): Promise<any> {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };

        const body = {
            model: 'mistral-tiny',
            messages: [
                { role: 'user', content: question }
            ]
        };

        const response = await firstValueFrom(
            this.httpService.post(this.apiUrl, body, { headers })
        );
        return response.data;
    }
}