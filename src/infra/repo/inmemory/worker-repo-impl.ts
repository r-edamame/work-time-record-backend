import { Worker } from '@domain/model/worker';
import { WorkerRepo } from '@domain/repo/worker-repo';

export class InMemoryWorkerRepo implements WorkerRepo {
  private workers: Worker[];

  constructor() {
    this.workers = [];
  }

  async getWorkerById(id: string): Promise<Worker> {
    const worker = this.workers.find((w) => w.id === id);
    if (worker === undefined) {
      throw new Error('worker not found');
    }
    return worker;
  }

  async listWorkers(): Promise<Worker[]> {
    return this.workers;
  }

  async saveWorker(worker: Worker): Promise<true> {
    const ix = this.workers.findIndex((w) => w.id === worker.id);
    if (ix !== -1) {
      this.workers[ix] = worker;
    } else {
      this.workers.push(worker);
    }

    return true;
  }
}
