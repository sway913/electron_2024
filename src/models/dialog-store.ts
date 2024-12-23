/* Copyright (c) 2021-2024 Damon Smith */

import { ipcRenderer } from "electron"
import { observable, computed, makeObservable } from "mobx"
import { getTheme } from "~/utils/themes"
import { ISettings } from "~/interfaces"
import { DEFAULT_SETTINGS } from "~/constants"

export declare interface DialogStore {
    onVisibilityChange: (visible: boolean, ...args: any[]) => void
    onUpdateTabInfo: (tabId: number, data: any) => void
    onHide: (data: any) => void
}

export class DialogStore {
    public settings: ISettings = DEFAULT_SETTINGS

    public get theme() {
        return getTheme(this.settings.theme)
    }

    private _windowId = -1

    private readonly persistent: boolean = false

    public visible = false

    public firstTime = false

    public constructor(
        options: {
            hideOnBlur?: boolean
            visibilityWrapper?: boolean
            persistent?: boolean
        } = {}
    ) {
        makeObservable(this, {
            settings: observable,
            theme: computed,
            visible: observable
        })

        const { visibilityWrapper, hideOnBlur, persistent } = {
            hideOnBlur: true,
            visibilityWrapper: true,
            persistent: false,
            ...options
        }

        if (!persistent) this.visible = true

        this.persistent = persistent

        if (visibilityWrapper && persistent) {
            ipcRenderer.on("visible", async (e, flag, ...args) => {
                this.onVisibilityChange(flag, ...args)
            })
        }

        if (hideOnBlur) {
            window.addEventListener("blur", () => {
                this.hide()
            })
        }

        this.settings = {
            ...this.settings,
            ...ipcRenderer.sendSync("get-settings-sync")
        }

        ipcRenderer.on("update-settings", (e, settings: ISettings) => {
            this.settings = { ...this.settings, ...settings }
        })

        ipcRenderer.on("update-tab-info", (e, tabId, data) =>
            this.onUpdateTabInfo(tabId, data)
        )

        this.onHide = () => {}
        this.onUpdateTabInfo = () => {}
        this.onVisibilityChange = () => {}

        this.send("loaded")
    }

    public async invoke(channel: string, ...args: any[]) {
        return await ipcRenderer.invoke(`${channel}-${this.id}`, ...args)
    }

    public send(channel: string, ...args: any[]) {
        ipcRenderer.send(`${channel}-${this.id}`, ...args)
    }

    public get id() {
        const windowId: number = ipcRenderer.sendSync("get-current-window-id")
        return windowId
    }

    public get windowId() {
        if (this._windowId === -1) {
            const windowId: number = ipcRenderer.sendSync(
                "get-current-window-id"
            )
            this._windowId = windowId
        }

        return this._windowId
    }

    public hide(data: any = null) {
        if (this.persistent && !this.visible) return
        this.visible = false
        this.onHide(data)
        setTimeout(async () => {
            await this.send("hide")
        })
    }
}
