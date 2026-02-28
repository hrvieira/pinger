import { Module } from '@nestjs/common';
import { MonitorsService } from './monitors.service';
import { MonitorsController } from './monitors.controller';
import { PrismaService } from '../prisma.service';
import { MonitorsCronController } from './monitors-cron.controller';

@Module({
  controllers: [MonitorsController, MonitorsCronController],
  providers: [MonitorsService, PrismaService],
})
export class MonitorsModule {}
