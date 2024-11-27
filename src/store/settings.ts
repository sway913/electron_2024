/* Copyright (c) 2021-2024 Damon Smith */

import { observable, action, computed, makeObservable } from 'mobx';
import { ISettings } from '@/interfaces/settings';
import { DEFAULT_SETTINGS } from '~/constants';
import { Store } from '.';

export type SettingsSection =
  | 'startup'

export class SettingsStore {
  public selectedSection: SettingsSection = 'startup';

  public object: ISettings = DEFAULT_SETTINGS;

  public store: Store;

  public constructor(store: Store) {
    makeObservable(this, {
      selectedSection: observable,
      object: observable,
      updateSettings: action,
    });

    this.store = store;

    let firstTime = false;
  }

  public updateSettings(newSettings: ISettings) {
    const prevState = { ...this.object };
    this.object = { ...this.object, ...newSettings };
  }

  public async save() {

  }
}
