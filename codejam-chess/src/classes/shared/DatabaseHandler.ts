import { IReplayData } from '../../intefaces';

export class DatabaseHandler {
  private idDB: IDBFactory;

  private openRequest: IDBOpenDBRequest | undefined;

  private db: IDBDatabase | undefined;

  private dbStore: IDBObjectStore | undefined;

  private transaction: IDBTransaction | undefined;

  private readonly dbName = `Kaesid-corejam-chess`;

  constructor() {
    this.idDB = window.indexedDB;
  }

  public async getAll(): Promise<IReplayData[]> {
    return new Promise(resolve => {
      this.init(this.dbName).then(() => {
        this.connect();

        const request: IDBRequest<IReplayData[]> = (this.dbStore as IDBObjectStore).getAll();

        request.onsuccess = () => {
          resolve(request.result);
        };
      });
    });
  }

  public async getById(id: number): Promise<IReplayData> {
    return new Promise(resolve => {
      this.init(this.dbName).then(() => {
        this.connect();

        const request: IDBRequest<IReplayData> = (this.dbStore as IDBObjectStore).get(id);

        request.onsuccess = () => {
          resolve(request.result);
        };
      });
    });
  }

  private init(dbName: string, dbVersion?: number): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      this.openRequest = this.idDB.open(dbName, dbVersion);

      this.openRequest.onupgradeneeded = () => {
        this.dbConstruction();
      };
      this.openRequest.onerror = () => {
        this.db = (this.openRequest as IDBOpenDBRequest).result;
        reject(this.db);
      };

      this.openRequest.onsuccess = () => {
        this.db = (this.openRequest as IDBOpenDBRequest).result;
        resolve(this.db);
      };
    });
  }

  private dbConstruction(): void {
    this.db = (this.openRequest as IDBOpenDBRequest).result;
    this.dbStore = (this.db as IDBDatabase).createObjectStore('userData', {
      keyPath: 'id',
      autoIncrement: true,
    });

    this.dbStore.createIndex('winner', 'winner');

    this.dbStore.createIndex('whitePlayer', 'whitePlayer');

    this.dbStore.createIndex('whiteAvatar', 'whiteAvatar');

    this.dbStore.createIndex('blackPlayer', 'blackPlayer');

    this.dbStore.createIndex('blackAvatar', 'blackAvatar');

    this.dbStore.createIndex('gameTime', 'gameTime');

    this.dbStore.createIndex('turns', 'turns');

    this.dbStore.createIndex('turnsTime', 'turnsTime');

    this.dbStore.createIndex('whiteHandicap', 'whiteHandicap');

    this.dbStore.createIndex('blackHandicap', 'blackHandicap');
  }

  public addReplay(replayData: IReplayData): Promise<void> {
    return new Promise(resolve => {
      this.init(this.dbName).then(() => {
        this.connect();

        const dbInject = (this.dbStore as IDBObjectStore).add(replayData);

        dbInject.onsuccess = () => {
          resolve();
        };
      });
    });
  }

  private connect(): void {
    this.db = (this.openRequest as IDBOpenDBRequest).result;

    this.transaction = this.db.transaction('userData', 'readwrite');

    this.dbStore = this.transaction.objectStore('userData');
  }
}
