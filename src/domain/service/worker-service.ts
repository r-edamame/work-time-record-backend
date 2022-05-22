import { Worker } from '@domain/model/worker';
import { WorkerRepo } from '@domain/repo/worker-repo';

export class WorkerService {
  constructor(private readonly workerRepo: WorkerRepo) {}

  async registerWorker(name: string): Promise<Worker> {
    const worker = Worker.createWorker(name);
    await this.workerRepo.saveWorker(worker);
    return worker;
  }
}
