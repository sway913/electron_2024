/* Copyright (c) 2021-2024 Damon Smith */

import { ipcMain, dialog } from 'electron';
import Nedb, * as Datastore from '@seald-io/nedb';

import { getPath } from '~/utils'; // Import getPath function from utils module
import {
  IFindOperation,
  IInsertOperation,
  IRemoveOperation,
  IUpdateOperation,
} from '~/interfaces';
import { promises } from 'fs';
import * as parse from 'node-parse-bookmarks';
import { Settings } from '../models/settings';

interface Databases {
[key: string]: Nedb;
}

export class StorageService {
  public settings: Settings;

  public databases: Databases = {

  };

  public favicons: Map<any, any> = new Map();

  public constructor(settings: Settings) {
    this.settings = settings;

    ipcMain.handle('storage-get', async (e, data: IFindOperation) => {
      return await this.find(data);
    });

    ipcMain.handle('storage-get-one', async (e, data: IFindOperation) => {
      return await this.findOne(data);
    });

    ipcMain.handle('storage-insert', async (e, data: IInsertOperation) => {
      return await this.insert(data);
    });

    ipcMain.handle('storage-remove', async (e, data: IRemoveOperation) => {
      return await this.remove(data);
    });

    ipcMain.handle('storage-update', async (e, data: IUpdateOperation) => {
      return await this.update(data);
    });

    ipcMain.handle('import-bookmarks', async () => {
      const dialogRes = await dialog.showOpenDialog({
        filters: [{ name: 'Bookmark file', extensions: ['html'] }],
      });

      try {
        const file = await promises.readFile(dialogRes.filePaths[0], 'utf8');
        return parse(file);
      } catch (err) {
        console.error(err);
      }

      return [];
    });


    ipcMain.handle('history-get', () => {
      return '';
    });

    ipcMain.on('history-remove', (e, ids: string[]) => {

    });

    ipcMain.handle('topsites-get', (e, count) => {

    });
  }

  public find<T>(data: IFindOperation): Promise<T[]> {
    const { scope, query } = data;

    return new Promise((resolve, reject) => {
      this.databases[scope].find(query, (err: any, docs: any) => {
        if (err) reject(err);
        resolve(docs);
      });
    });
  }

  public findOne<T>(data: IFindOperation): Promise<T> {
    const { scope, query } = data;

    return new Promise((resolve, reject) => {
      this.databases[scope].findOne(query, (err: any, doc: any) => {
        if (err) reject(err);
        resolve(doc);
      });
    });
  }

  public insert<T>(data: IInsertOperation): Promise<T> {
    const { scope, item } = data;

    return new Promise((resolve, reject) => {
      this.databases[scope].insert(item, (err: any, doc: any) => {
        if (err) reject(err);
        resolve(doc);
      });
    });
  }

  public remove(data: IRemoveOperation): Promise<number> {
    const { scope, query, multi } = data;

    return new Promise((resolve, reject) => {
      this.databases[scope].remove(
        query,
        { multi },
        (err: any, removed: number) => {
          if (err) reject(err);
          resolve(removed);
        },
      );
    });
  }

  public update(data: IUpdateOperation): Promise<number> {
    const { scope, query, value, multi } = data;

    return new Promise((resolve, reject) => {
      this.databases[scope].update(
        query,
        { $set: value },
        { multi },
        (err: any, replaced: number) => {
          if (err) reject(err);
          resolve(replaced);
        },
      );
    });
  }

  public async run() {
    for (const key in this.databases) {
      this.databases[key] = this.createDatabase(key.toLowerCase());
    }
  }

  private createDatabase = (name: string) => {
    // @ts-ignore
    return new Datastore({
      filename: getPath(`storage/${name}.db`),
      autoload: true,
    });
  };

}
