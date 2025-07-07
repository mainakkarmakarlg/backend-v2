import { Test, TestingModule } from '@nestjs/testing';
import { DoubtforumController } from './doubtforum.controller';

describe('DoubtforumController', () => {
  let controller: DoubtforumController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoubtforumController],
    }).compile();

    controller = module.get<DoubtforumController>(DoubtforumController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
