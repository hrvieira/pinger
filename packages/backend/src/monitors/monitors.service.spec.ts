import { Test, TestingModule } from '@nestjs/testing';
import { MonitorsService } from './monitors.service';
import { PrismaService } from '../prisma.service';

// Mock do PrismaService para não aceder ao banco real
const mockPrismaService = {
  monitor: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('MonitorsService', () => {
  let service: MonitorsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitorsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MonitorsService>(MonitorsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um novo monitor', async () => {
      const createDto = { name: 'Google', url: 'https://google.com' };
      const result = {
        id: 1,
        ...createDto,
        isActive: true,
        status: 'pending',
        lastChecked: null,
        createdAt: new Date(),
      };

      // Configura o mock para retornar o resultado esperado
      (prisma.monitor.create as jest.Mock).mockResolvedValue(result);

      expect(await service.create(createDto)).toEqual(result);
      expect(prisma.monitor.create).toHaveBeenCalledWith({ data: createDto });
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de monitores', async () => {
      const result = [
        {
          id: 1,
          name: 'Google',
          url: 'https://google.com',
          isActive: true,
          status: 'up',
          lastChecked: new Date(),
          createdAt: new Date(),
        },
      ];

      (prisma.monitor.findMany as jest.Mock).mockResolvedValue(result);

      expect(await service.findAll()).toEqual(result);
      expect(prisma.monitor.findMany).toHaveBeenCalled();
    });
  });
});
