/* Copyright (c) 2021-2024 Damon Smith */

import { WebContentsView, app, ipcMain } from 'electron';
import { URL } from 'url';
import { AppWindow } from './windows';
import {
  ERROR_PROTOCOL,
  NETWORK_ERROR_HOST,
  WEBUI_BASE_URL,
} from '~/constants/files';
import { NEWTAB_URL } from '~/constants/tabs';
import {
  ZOOM_FACTOR_MIN,
  ZOOM_FACTOR_MAX,
  ZOOM_FACTOR_INCREMENT,
} from '~/constants/web-contents';
import { TabEvent } from '~/interfaces/tabs';
import { Queue } from '~/utils/queue';
import { Application } from './application';
import { getUserAgentForURL } from './user-agent';

interface IAuthInfo {
  url: string;
}

export class View {
  public webContentsView: WebContentsView;

  public isNewTab = false;
  public homeUrl: string;
  public favicon = '';
  public color = '';
  public incognito = false;

  public errorURL = '';

  private hasError = false;

  private readonly window: AppWindow;

  public bounds: any;

  public findInfo = {
    occurrences: '0/0',
    text: '',
  };

  private lastUrl = '';

  public constructor(window: AppWindow, url: string, incognito: boolean) {
    const { object: webset } = Application.instance.settings;
    this.webContentsView = new WebContentsView({
      webPreferences: {
        preload: `${app.getAppPath()}/build/view-preload.bundle.js`,
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        partition: incognito ? 'view_incognito' : 'persist:view',
        plugins: true,
        webSecurity: true,
        javascript: true,
      },
    });

    this.webContentsView.setBackgroundColor('#FFFFFFFF');

    this.incognito = incognito;

    this.webContents.userAgent = getUserAgentForURL(
      this.webContents.userAgent,
      '',
    );

    (this.webContents as any).windowId = window.win.id;

    this.window = window;
    this.homeUrl = url;

    this.webContents.session.webRequest.onBeforeSendHeaders(
      (details, callback) => {
        callback({ requestHeaders: details.requestHeaders });
      },
    );

    ipcMain.handle(`get-error-url-${this.id}`, async () => {
      return this.errorURL;
    });

    this.webContents.on('context-menu', (e, params) => {

    });

    this.webContents.addListener('page-title-updated', async (e, title) => {
      this.window.updateTitle();
      await this.updateData();

      this.emitEvent('title-updated', title);
      await this.updateURL(this.webContents.getURL());
    });

    this.webContents.addListener('did-navigate', async (e, url) => {
      this.webContentsView.setBackgroundColor('#FFFFFFFF');
      this.emitEvent('did-navigate', url);
      await this.updateURL(url);
    });

    this.webContents.addListener(
      'did-navigate-in-page',
      async (e, url, isMainFrame) => {
        if (isMainFrame) {
          this.webContentsView.setBackgroundColor('#FFFFFFFF');
          this.window.updateTitle();
          await this.updateData();

          this.emitEvent(
            'title-updated',
            this.webContentsView.webContents.getTitle(),
          );
          this.emitEvent('did-navigate', url);

          await this.updateURL(url);
        }
      },
    );

    this.webContents.addListener('did-stop-loading', async () => {
      this.webContentsView.setBackgroundColor('#FFFFFFFF');
      this.updateNavigationState();
      this.emitEvent('loading', false);
      await this.updateURL(this.webContents.getURL());
    });

    this.webContents.addListener('did-start-loading', async () => {
      this.webContentsView.setBackgroundColor('#FFFFFFFF');
      this.hasError = false;
      this.updateNavigationState();
      this.emitEvent('loading', true);
      await this.updateURL(this.webContents.getURL());
    });

    this.webContents.addListener('did-start-navigation', async (e, ...args) => {
      this.webContentsView.setBackgroundColor('#FFFFFFFF');
      this.updateNavigationState();

      this.favicon = '';

      this.emitEvent('load-commit', ...args);
      await this.updateURL(this.webContents.getURL());
    });

    this.webContents.on(
      'did-start-navigation',
      (e, url, isInPlace, isMainFrame) => {
        if (!isMainFrame) return;
        const newUA = getUserAgentForURL(this.webContents.userAgent, url);
        if (this.webContents.userAgent !== newUA) {
          this.webContents.userAgent = newUA;
        }
      },
    );

    this.webContents.setWindowOpenHandler(({ url, frameName, disposition }) => {
      if (disposition === 'new-window') {
        this.window.viewManager.create({ url, active: true }, true);
        return { action: 'deny' };
      } else if (disposition === 'foreground-tab') {
        this.window.viewManager.create({ url, active: true }, true);
        return { action: 'deny' };
      } else if (disposition === 'background-tab') {
        this.window.viewManager.create({ url, active: false }, true);
        return { action: 'deny' };
      }
      return { action: 'allow' };
    });

    this.webContents.addListener(
      'did-fail-load',
      async (e, errorCode, errorDescription, validatedURL, isMainFrame) => {
        console.error(errorCode, errorDescription, validatedURL, isMainFrame);
        // ignore -3 (ABORTED) - An operation was aborted (due to user action).
        if (isMainFrame && errorCode !== -3) {
          this.errorURL = validatedURL;

          this.hasError = true;

          await this.webContents.loadURL(
            `${ERROR_PROTOCOL}://${NETWORK_ERROR_HOST}/${errorCode}`,
          );
        }
      },
    );

    this.webContents.addListener('page-favicon-updated', async (event, favicons) => {
      if (favicons.length > 0) {
        this.favicon = favicons[0];
      } else {
        console.error('Favicon array was empty.');
        this.favicon = 'default_favicon_url'; // Set a default favicon URL
      }
      await this.updateData();
    });

    this.webContents.addListener('media-started-playing', () => {
      this.emitEvent('media-playing', true);
    });

    this.webContents.addListener('media-paused', () => {
      this.emitEvent('media-paused', true);
    });

    if (url.startsWith(NEWTAB_URL)) this.isNewTab = true;

    (async () => {
      await this.webContents.loadURL(url);
    })();

  }
  updateFavicon() {
    throw new Error('Method not implemented.');
  }

  public get webContents() {
    return this.webContentsView.webContents;
  }

  public get url() {
    return this.webContents.getURL();
  }

  public get title() {
    return this.webContents.getTitle();
  }

  public get id() {
    return this.webContents.id;
  }

  public get isSelected() {
    return this.id === this.window.viewManager.selectedId;
  }

  public updateNavigationState() {
    if (this.webContentsView.webContents.isDestroyed()) return;
  }

  public destroy() {
    (this.webContentsView.webContents as any).destroy();
    // this.webContentsView = null;
  }

  public async updateCredentials() {
    if (
      !process.env.ENABLE_AUTOFILL ||
      this.webContentsView.webContents.isDestroyed()
    )
      return;

    const item = await Application.instance.storage.findOne<any>({
      scope: 'formfill',
      query: {
        url: this.hostname,
      },
    });

    this.emitEvent('credentials', item != null);
  }

  public updateURL = async (url: string) => {
    if (this.lastUrl === url) return;

    this.emitEvent('url-updated', this.hasError ? this.errorURL : url);

    this.lastUrl = url;

    this.isNewTab = url.startsWith(NEWTAB_URL);

    await this.updateData();

    this.updateBookmark();

    this.updateUIpage(url);
  };

  public updateUIpage(url: string) {
    this.window.send(
      'is-ui-page',
      url.startsWith(WEBUI_BASE_URL) || url.startsWith(NETWORK_ERROR_HOST),
    );
  }

  public updateBookmark() {

  }

  public async updateData() {

  }

  public send(channel: string, ...args: any[]) {
    this.webContents.send(channel, ...args);
  }

  public get hostname() {
    return new URL(this.url).hostname;
  }

  public emitEvent(event: TabEvent, ...args: any[]) {
    this.window.send('tab-event', event, this.id, args);
  }
}
