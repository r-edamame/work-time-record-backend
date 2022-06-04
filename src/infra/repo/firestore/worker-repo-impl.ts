import { Worker } from '@domain/model/worker';
import { WorkerRepo } from '@domain/repo/worker-repo';
import firestore from 'firebase-admin/firestore';

const fromDocumentData = (id: string, raw: firestore.DocumentData): Worker => {
  const name = raw?.name;
  if (typeof name !== 'string') {
    throw new Error('invalid data');
  }

  return new Worker(id, name);
};

export class FirestoreWorkerRepoImpl implements WorkerRepo {
  private workers: firestore.CollectionReference;

  constructor(db: firestore.Firestore) {
    this.workers = db.collection('workers');
  }

  async getWorkerById(id: string): Promise<Worker> {
    const response = await this.workers.doc(id).get();
    const worker = response.data();
    if (!worker) {
      throw new Error('worker not found');
    }

    const name = worker?.name;
    if (typeof name !== 'string') {
      throw new Error('name is empty');
    }

    return new Worker(id, name);
  }

  async listWorkers(): Promise<Worker[]> {
    const response = await this.workers.get();
    const workers = response.docs.map((snapshot) => fromDocumentData(snapshot.id, snapshot.data()));

    return workers;
  }

  async saveWorker(worker: Worker): Promise<true> {
    await this.workers.doc(worker.id).set({
      name: worker.name,
    });

    return true;
  }
}
