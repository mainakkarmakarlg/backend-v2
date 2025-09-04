import { Test, TestingModule } from '@nestjs/testing';
import { VultrService } from './vultr.service';

describe('VultrService', () => {
  let service: VultrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VultrService],
    }).compile();

    service = module.get<VultrService>(VultrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
