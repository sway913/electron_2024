/* Copyright (c) 2021-2024 Damon Smith */

import { app, ipcRenderer } from 'electron';
import { getTheme } from '~/utils/themes';
import { ERROR_PROTOCOL, WEBUI_BASE_URL } from '~/constants/files';
import { contextBridge } from 'electron';
const tabId = ipcRenderer.sendSync('get-webcontents-id');

export const windowId: number = ipcRenderer.sendSync('get-window-id');

const goBack = async () => {
  await ipcRenderer.invoke(`web-contents-call`, {
    webContentsId: tabId,
    method: 'goBack',
  });
};

const goForward = async () => {
  await ipcRenderer.invoke(`web-contents-call`, {
    webContentsId: tabId,
    method: 'goForward',
  });
};

window.addEventListener('mouseup', async (e) => {
  if (e.button === 3) {
    e.preventDefault();
    await goBack();
  } else if (e.button === 4) {
    e.preventDefault();
    await goForward();
  }
});

let beginningScrollLeft: number = 0;
let beginningScrollRight: number = 0;
let horizontalMouseMove = 0;
let verticalMouseMove = 0;

const resetCounters = () => {
  beginningScrollLeft = 0;
  beginningScrollRight = 0;
  horizontalMouseMove = 0;
  verticalMouseMove = 0;
};

function getScrollStartPoint(x: number, y: number) {
  let left = 0;
  let right = 0;

  let n = document.elementFromPoint(x, y);

  while (n) {
    if (n.scrollLeft !== undefined) {
      left = Math.max(left, n.scrollLeft);
      right = Math.max(right, n.scrollWidth - n.clientWidth - n.scrollLeft);
    }
    n = n.parentElement;
  }
  return { left, right };
}

document.addEventListener('wheel', (e) => {
  verticalMouseMove += e.deltaY;
  horizontalMouseMove += e.deltaX;

  if (beginningScrollLeft === null || beginningScrollRight === null) {
    const result = getScrollStartPoint(e.deltaX, e.deltaY);
    beginningScrollLeft = result.left;
    beginningScrollRight = result.right;
  }
});

ipcRenderer.on('scroll-touch-end', async () => {
  if (
    horizontalMouseMove - beginningScrollRight > 150 &&
    Math.abs(horizontalMouseMove / verticalMouseMove) > 2.5
  ) {
    if (beginningScrollRight < 10) {
      await goForward();
    }
  }

  if (
    horizontalMouseMove + beginningScrollLeft < -150 &&
    Math.abs(horizontalMouseMove / verticalMouseMove) > 2.5
  ) {
    if (beginningScrollLeft < 10) {
      await goBack();
    }
  }

  resetCounters();
});

const postMsg = (data: any, res: any) => {
  window.postMessage(
    {
      id: data.id,
      result: res,
      type: 'result',
    },
    '*',
  );
};

const hostname = window.location.href.substr(WEBUI_BASE_URL.length);

const settings = ipcRenderer.sendSync('get-settings-sync');
if (
  window.location.href.startsWith(WEBUI_BASE_URL) ||
  window.location.protocol === `${ERROR_PROTOCOL}:`
) {
  (async function () {
    contextBridge.exposeInMainWorld('process', process);
    contextBridge.exposeInMainWorld('settings', settings);
    contextBridge.exposeInMainWorld('require', (id: string) => {
      if (id === 'electron') {
        return { ipcRenderer, app };
      }
      return undefined;
    });
    if (window.location.pathname.startsWith('//network-error')) {
      contextBridge.exposeInMainWorld('theme', getTheme(settings.theme));
      contextBridge.exposeInMainWorld(
        'errorURL',
        await ipcRenderer.invoke(`get-error-url-${tabId}`),
      );
    }
  })();
}

if (window.location.href.startsWith(WEBUI_BASE_URL)) {
  window.addEventListener('DOMContentLoaded', () => {
    if (hostname.startsWith('settings')) document.title = 'Settings';
  });

  window.addEventListener('message', async ({ data }) => {
    if (data.type === 'storage') {
      const res = await ipcRenderer.invoke(`storage-${data.operation}`, {
        scope: data.scope,
        ...data.data,
      });

      postMsg(data, res);
    } else if (data.type === 'credentials-get-password') {
      const res = await ipcRenderer.invoke(
        'credentials-get-password',
        data.data,
      );
      postMsg(data, res);
    } else if (data.type === 'save-settings') {
      ipcRenderer.send('save-settings', { settings: data.data });
    }
  });

  // Unused as of v1.0.0
  // ipcRenderer.on('update-settings', async (e, data) => {
  //   await webFrame.executeJavaScript(
  //     `window.updateSettings(${JSON.stringify(data)})`,
  //   );
  // });

  ipcRenderer.on('credentials-insert', (e, data) => {
    window.postMessage(
      {
        type: 'credentials-insert',
        data,
      },
      '*',
    );
  });

  ipcRenderer.on('credentials-update', (e, data) => {
    window.postMessage(
      {
        type: 'credentials-update',
        data,
      },
      '*',
    );
  });

  ipcRenderer.on('credentials-remove', (e, data) => {
    window.postMessage(
      {
        type: 'credentials-remove',
        data,
      },
      '*',
    );
  });
}
