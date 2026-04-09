// Alexsander Xavier - 4338139
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
