/* Copyright (c) 2021-2024 Damon Smith */

import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { ThemeProvider } from 'styled-components';

import { StyledApp, Line } from './style';
import { Titlebar } from '../Titlebar';
import store from '../../store';
import { UIStyle } from '@/mixins/default-styles';
import {
  DEFAULT_TITLEBAR_HEIGHT,
  COMPACT_TITLEBAR_HEIGHT,
  DEFAULT_TAB_MARGIN_TOP,
  COMPACT_TAB_MARGIN_TOP,
  COMPACT_TAB_HEIGHT,
  DEFAULT_TAB_HEIGHT,
} from '~/constants/design';

const onAppLeave = () => {
  setTimeout(function () {
    if (
      Object.keys(store.dialogsVisibility).some(
        (k) => store.dialogsVisibility[k],
      )
    ) {
      onAppLeave();
    } else {
      store.titlebarVisible = false;
    }
  }, 500);
};

const onAppEnter = () => {
  clearTimeout(store.barHideTimer);
};

const onLineEnter = () => {
  store.titlebarVisible = true;
};

const App = observer(() => {
  return (
    <ThemeProvider
      theme={{
        ...store.theme,
        animations: store.settings.object.animations,
        isCompact: store.isCompact,
        titlebarHeight: !store.isCompact
          ? DEFAULT_TITLEBAR_HEIGHT
          : COMPACT_TITLEBAR_HEIGHT,
        tabMarginTop: !store.isCompact
          ? DEFAULT_TAB_MARGIN_TOP
          : COMPACT_TAB_MARGIN_TOP,
        tabHeight: store.isCompact ? COMPACT_TAB_HEIGHT : DEFAULT_TAB_HEIGHT,
      }}
    >
      <StyledApp
        onMouseOver={store.isFullscreen ? onAppEnter : undefined}
        onMouseLeave={store.isFullscreen ? onAppLeave : undefined}
        style={{
          height: !store.isFullscreen || store.titlebarVisible ? null : 0,
        }}
      >
        <UIStyle />
        <Titlebar />
      </StyledApp>
      <Line
        onMouseOver={onLineEnter}
        style={{ height: store.isFullscreen && !store.titlebarVisible ? 1 : 0 }}
      />
    </ThemeProvider>
  );
});

export default App;
