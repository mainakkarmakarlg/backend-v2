import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeGateway } from './employee.gateway';
import { EmployeeService } from './employee.service';

describe('EmployeeGateway', () => {
  let gateway: EmployeeGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeGateway, EmployeeService],
    }).compile();

    gateway = module.get<EmployeeGateway>(EmployeeGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
