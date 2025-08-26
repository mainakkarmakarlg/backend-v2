import { Test, TestingModule } from '@nestjs/testing';
import { VultrController } from './vultr.controller';

describe('VultrController', () => {
  let controller: VultrController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VultrController],
    }).compile();

    controller = module.get<VultrController>(VultrController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
