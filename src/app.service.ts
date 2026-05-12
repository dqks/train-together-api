import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  get serverUrl() {
    return this.configService.get<string>('SERVER_URL');
  }

  getImageUrl(imagePath: string) {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const normalizedPath = imagePath.startsWith('/')
      ? imagePath
      : `/${imagePath}`;
    return `${this.serverUrl}${normalizedPath}`;
  }
}
