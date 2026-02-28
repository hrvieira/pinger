import { Controller, Get } from '@nestjs/common';
import { MonitorsService } from './monitors.service';

@Controller('api/cron')
export class MonitorsCronController {
  constructor(private readonly monitorsService: MonitorsService) {}

  @Get('monitores')
  async runMonitores() {
    await this.monitorsService.handleCron();
    return { status: '✅ Monitoramento executado pelo cron-job.org!' };
  }
}
