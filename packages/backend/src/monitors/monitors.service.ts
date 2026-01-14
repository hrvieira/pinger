import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';

@Injectable()
export class MonitorsService {
  private readonly logger = new Logger(MonitorsService.name);

  constructor(private prisma: PrismaService) {}

  // --- PARTE NOVA: O PINGER AUTOMÁTICO ---
  @Cron('0 */10 * * * *') // Roda a cada 10 minutos
  async handleCron() {
    this.logger.debug('🔍 Iniciando verificação dos monitores...');

    // 1. Busca todos os monitores ativos no banco
    const monitors = await this.prisma.monitor.findMany({
      where: { isActive: true },
    });

    // 2. Testa cada um deles
    for (const monitor of monitors) {
      const start = Date.now();
      try {
        // Tenta acessar o site (timeout de 5 segundos)
        const response = await fetch(monitor.url, {
          signal: AbortSignal.timeout(5000),
        });

        // Se o status for 200-299, está UP. Senão, está DOWN.
        const isUp = response.ok;
        const status = isUp ? 'up' : 'down';

        this.logger.log(
          `✅ ${monitor.name} está ${status} (Status: ${response.status})`,
        );

        // 3. Atualiza no banco
        await this.prisma.monitor.update({
          where: { id: monitor.id },
          data: {
            status: status,
            lastChecked: new Date(),
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`❌ ${monitor.name} falhou: ${errorMessage}`);

        // Se deu erro de rede (site fora do ar), marca como down
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
  // --- FIM DA PARTE NOVA ---

  create(createMonitorDto: CreateMonitorDto) {
    return this.prisma.monitor.create({
      data: createMonitorDto,
    });
  }

  findAll() {
    return this.prisma.monitor.findMany({
      orderBy: { id: 'asc' }, // Ordena por ID para a lista não ficar pulando
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
