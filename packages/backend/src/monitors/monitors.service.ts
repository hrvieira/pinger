import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';

@Injectable()
export class MonitorsService {
  private readonly logger = new Logger(MonitorsService.name);

  constructor(private prisma: PrismaService) {}

  @Cron('0 */10 * * * *') // Executa a cada 10 minutos
  async handleCron() {
    this.logger.debug('🔍 Iniciando verificação dos monitores...');

    const monitors = await this.prisma.monitor.findMany({
      where: { isActive: true },
    });

    for (const monitor of monitors) {
      try {
        // Timeout de 5s para evitar travamentos
        const response = await fetch(monitor.url, {
          signal: AbortSignal.timeout(5000),
        });

        const status = response.ok ? 'up' : 'down';

        this.logger.log(
          `✅ ${monitor.name} está ${status} (Status: ${response.status})`,
        );

        await this.prisma.monitor.update({
          where: { id: monitor.id },
          data: {
            status: status,
            lastChecked: new Date(),
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(`❌ ${monitor.name} falhou: ${errorMessage}`);

        await this.prisma.monitor.update({
          where: { id: monitor.id },
          data: {
            status: 'down',
            lastChecked: new Date(),
          },
        });
      }
    }
  }

  create(createMonitorDto: CreateMonitorDto) {
    return this.prisma.monitor.create({
      data: createMonitorDto,
    });
  }

  findAll() {
    return this.prisma.monitor.findMany({
      orderBy: { id: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.monitor.findUnique({ where: { id } });
  }

  update(id: number, updateMonitorDto: UpdateMonitorDto) {
    return this.prisma.monitor.update({
      where: { id },
      data: updateMonitorDto,
    });
  }

  remove(id: number) {
    return this.prisma.monitor.delete({ where: { id } });
  }
}
