/* Copyright (c) 2021-2024 Damon Smith */

import { app, ipcMain } from 'electron';
import { isAbsolute, extname } from 'path';
import { existsSync } from 'fs';
import { SessionsService } from './sessions-service';
import { checkFiles } from '~/utils/files';
import { Settings } from './models/settings';
import { isURL, prefixHttp } from '~/utils';
import { WindowsService } from './windows-service';
import { StorageService } from './services/storage';
import { runAutoUpdaterService } from './services';
import { DialogsService } from './services/dialogs-service';

export class Application {
  public static instance = new Application();

  public sessions!: SessionsService;

  public settings!: Settings;

  public storage!: StorageService;

  public windows!: WindowsService;

  public dialogs = new DialogsService();

  public async start() {
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
      app.quit();
      return;
    } else {
      app.on('open-url', async (_, url) => {
        if (!this.windows.current) {
          this.windows.current = this.windows.open();
        }
        this.windows.current.win.focus();
        this.windows.current.viewManager.create({
          url: url,
          active: true,
        });
        this.windows.current.win.webContents.once('dom-ready', () => {
          if (!this.windows.current) return;
          this.windows.current.viewManager.create({
            url: url,
            active: true,
          });
        });
      });

      app.on('second-instance', async (e, argv) => {
        const path = argv[argv.length - 1];

        if (isAbsolute(path) && existsSync(path)) {
          if (process.env.NODE_ENV !== 'development') {
            const path = argv[argv.length - 1];
            const ext = extname(path);

            if (ext === '.html') {
              if (!this.windows.current) {
                this.windows.current = this.windows.open();
              }

              this.windows.current.win.focus();
              this.windows.current.viewManager.create({
                url: `file:///${path}`,
                active: true,
              });
              this.windows.current.win.webContents.once('dom-ready', () => {
                if (!this.windows.current) return;
                this.windows.current.viewManager.create({
                  url: `file:///${path}`,
                  active: true,
                });
              });
            }
          }
          return;
        } else if (isURL(path)) {
          if (!this.windows.current) {
            this.windows.current = this.windows.open();
          }

          this.windows.current.win.focus();
          this.windows.current.viewManager.create({
            url: prefixHttp(path),
            active: true,
          });
          this.windows.current.win.webContents.once('dom-ready', () => {
            if (!this.windows.current) return;
            this.windows.current.viewManager.create({
              url: prefixHttp(path),
              active: true,
            });
          });

          return;
        }

        this.windows.open();
      });
    }

    app.on('login', async (e, webContents, request, authInfo, callback) => {

    });

    ipcMain.on('create-window', (e, incognito = false) => {
      this.windows.open(incognito);
    });

    await this.onReady();
  }

  private async onReady() {
    await app.whenReady();

    checkFiles();

    this.sessions = new SessionsService();
    this.windows = new WindowsService(this.sessions);
    this.settings = new Settings();
    this.storage = new StorageService(this.settings);

    await this.storage.run();
    await this.dialogs.run();

    this.windows.open();

    runAutoUpdaterService();

    app.on('activate', () => {
      if (this.windows.list.filter((x) => x !== null).length === 0) {
        this.windows.open();
      }
    });
  }
}
