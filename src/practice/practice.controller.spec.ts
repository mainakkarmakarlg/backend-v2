import { Test, TestingModule } from '@nestjs/testing';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';

describe('PracticeController', () => {
  let controller: PracticeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PracticeController],
      providers: [PracticeService],
    }).compile();

    controller = module.get<PracticeController>(PracticeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
