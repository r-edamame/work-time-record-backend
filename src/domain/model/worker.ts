import { v4 as uuid } from 'uuid';

export class Worker {
  constructor(private _id: string, private _name: string) {}

  get id(): string {
    return this._id;
  }
  get name(): string {
    return this._name;
  }

  changeName(name: string) {
    this._name = name;
  }

  static createWorker(name: string): Worker {
    const id = `worker_${uuid()}`;
    return new Worker(id, name);
  }
}
