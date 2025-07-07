import { Test, TestingModule } from '@nestjs/testing';
import { MainGatewayGateway } from './main-gateway.gateway';

describe('MainGatewayGateway', () => {
  let gateway: MainGatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MainGatewayGateway],
    }).compile();

    gateway = module.get<MainGatewayGateway>(MainGatewayGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
