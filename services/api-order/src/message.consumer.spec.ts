import { Test, TestingModule } from '@nestjs/testing';
import { MessageConsumer } from './message.consumer';
import { Job } from 'bull';

describe('MessageConsumer', () => {
  let consumer: MessageConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageConsumer],
    }).compile();

    consumer = module.get<MessageConsumer>(MessageConsumer);
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  describe('readOperationJob', () => {
    it('should log job data', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const job = { data: { test: 'data' } } as Job;

      consumer.readOperationJob(job);

      expect(consoleSpy).toHaveBeenCalledWith({ test: 'data' });
      consoleSpy.mockRestore();
    });
  });
});
