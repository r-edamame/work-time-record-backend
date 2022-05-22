import { WorkerService } from './worker-service';
import { InMemoryWorkerRepo } from '@infra/repo/inmemory/worker-repo-impl';
import { Worker } from '@domain/model/worker';

const newService = () => {
  const repo = new InMemoryWorkerRepo();
  return new WorkerService(repo);
};

describe('WorkerService', () => {
  let service: WorkerService;

  beforeEach(() => {
    service = newService();
  });

  it('can register', async () => {
    const workerName = 'test-register';

    const service = newService();
    const worker = await service.registerWorker(workerName);

    expect(worker).toBeInstanceOf(Worker);
    expect(worker.name).toEqual('test-register');
    expect(typeof worker.id).toEqual('string');
  });
});
