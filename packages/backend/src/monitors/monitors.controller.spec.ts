import { Test, TestingModule } from '@nestjs/testing';
import { MonitorsController } from './monitors.controller';
import { MonitorsService } from './monitors.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';

describe('MonitorsController', () => {
  let controller: MonitorsController;
  let service: MonitorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitorsController],
      providers: [
        {
          provide: MonitorsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MonitorsController>(MonitorsController);
    service = module.get<MonitorsService>(MonitorsService);
  });

  it('deve criar um monitor', async () => {
    const dto = { name: 'Google', url: 'https://google.com' };
    const resultMock = {
      id: 1,
      ...dto,
      status: 'pending',
      lastChecked: null,
      isActive: true,
    };

    jest.spyOn(service, 'create').mockResolvedValue(resultMock as any);

    const result = await controller.create(dto as CreateMonitorDto);

    expect(result).toEqual(resultMock);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('deve listar todos os monitores', async () => {
    const mockList = [{ id: 1, name: 'Test' }];

    jest.spyOn(service, 'findAll').mockResolvedValue(mockList as any);

    expect(await controller.findAll()).toEqual(mockList);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('deve buscar um monitor por id', async () => {
    const mockMonitor = { id: 1, name: 'Test' };
    jest.spyOn(service, 'findOne').mockResolvedValue(mockMonitor as any);

    // O controller recebe ID como string (da URL) e converte para number
    expect(await controller.findOne('1')).toEqual(mockMonitor);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('deve deletar um monitor', async () => {
    jest.spyOn(service, 'remove').mockResolvedValue({ id: 1 } as any);

    expect(await controller.remove('1')).toEqual({ id: 1 });
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
