import { Worker } from '@domain/model/worker';
import { InMemoryWorkerRepo } from './worker-repo-impl';

const newRepo = () => {
  return new InMemoryWorkerRepo();
};

describe('InMemoryWorkerRepo', () => {
  it('can save and retrieve worker', async () => {
    const repo = newRepo();
    const worker = Worker.createWorker('test-save-1');

    const result = await repo.saveWorker(worker);
    expect(result).toBe(true);

    const retrieved = await repo.getWorkerById(worker.id);
    expect(retrieved.id).toEqual(worker.id);
    expect(retrieved.name).toEqual('test-save-1');
  });

  it('can list all workers', async () => {
    const repo = newRepo();
    const worker1 = Worker.createWorker('test-list-1');
    const worker2 = Worker.createWorker('test-list-2');
    const worker3 = Worker.createWorker('test-list-3');

    await repo.saveWorker(worker1);
    await repo.saveWorker(worker2);
    await repo.saveWorker(worker3);

    const find = (wkr: Worker, l: Worker[]): Worker | undefined => {
      return l.find((w) => w.id === wkr.id && w.name === wkr.name);
    };

    const list = await repo.listWorkers();

    expect(list.length).toEqual(3);
    expect(find(worker1, list)).not.toEqual(undefined);
    expect(find(worker2, list)).not.toEqual(undefined);
    expect(find(worker3, list)).not.toEqual(undefined);
  });

  it('should not save dupliated worker', async () => {
    const repo = newRepo();
    const worker = Worker.createWorker('test-duplicate');

    await repo.saveWorker(worker);
    await repo.saveWorker(worker);

    const list = await repo.listWorkers();

    expect(list.length).toEqual(1);
    expect(list[0].id).toEqual(worker.id);
    expect(list[0].name).toEqual('test-duplicate');
  });

  it('can update worker info', async () => {
    const repo = newRepo();
    const worker = Worker.createWorker('test-update');

    await repo.saveWorker(worker);

    worker.changeName('test-update-2');
    await repo.saveWorker(worker);

    const list = await repo.listWorkers();
    expect(list.length).toEqual(1);
    expect(list[0].id).toEqual(worker.id);
    expect(list[0].name).toEqual('test-update-2');
  });
});
