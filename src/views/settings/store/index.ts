/* Copyright (c) 2021-2024 Damon Smith */

import { observable, computed, makeObservable } from 'mobx';
import * as React from 'react';
import { ISettings, ITheme } from '~/interfaces';
import { getTheme } from '~/utils/themes';

export class Store {
  public menuRef = React.createRef<HTMLDivElement>();

  public dialogRef = React.createRef<HTMLDivElement>();

  public menuInfo = {
    left: 0,
    top: 0,
  };

  private _menuVisible = false;
  sections: any;

  public get menuVisible() {
    return this._menuVisible;
  }

  public set menuVisible(value: boolean) {
    this._menuVisible = value;

    if (value) {
      this.menuRef.current.focus();
    }
  }

  public dialogVisible = false;

  public dialogContent:
    | 'edit-search-engine'
    | 'add-search-engine'
    | 'edit-address'
    | 'edit-password'
    | 'privacy' = null;

  public settings: ISettings = { ...(window as any).settings };

  public get theme(): ITheme {
    return getTheme(this.settings.theme);
  }

  constructor() {
    makeObservable<Store, '_menuVisible'>(this, {
      menuInfo: observable,
      _menuVisible: observable,
      menuVisible: computed,
      dialogVisible: observable,
      dialogContent: observable,
      settings: observable,
      theme: computed,
    });

    (window as any).updateSettings = (settings: ISettings) => {
      this.settings = { ...this.settings, ...settings };
    };

    window.onmousedown = () => {
    };
  }

  public save() {
    delete this.settings.darkContents;
    delete this.settings.multrin;
    delete this.settings.shield;

    window.postMessage(
      {
        type: 'save-settings',
        data: JSON.stringify(this.settings),
      },
      '*',
    );
  }
}

export default new Store();
