import { Test, TestingModule } from '@nestjs/testing';
import { DoubtforumService } from './doubtforum.service';

describe('DoubtforumService', () => {
  let service: DoubtforumService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DoubtforumService],
    }).compile();

    service = module.get<DoubtforumService>(DoubtforumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
