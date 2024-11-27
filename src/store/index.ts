/* Copyright (c) 2021-2024 Damon Smith */

import { observable, computed, makeObservable, makeAutoObservable } from "mobx"
import { SettingsStore } from "./settings"
import { getTheme } from "@/utils/themes"

export class Store {
    public settings = new SettingsStore(this)

    public get theme() {
        return getTheme(this.settings.object.theme)
    }

    public constructor() {
        makeObservable(this, {
            theme: computed
        })
    }
}

export default new Store()
