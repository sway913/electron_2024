import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { ThemeProvider } from 'styled-components';

import { StyledApp, Colors, Color } from './style';
import store from '../../store';
import { ipcRenderer } from 'electron';
import {
  BLUE_500,
  RED_500,
  PINK_500,
  PURPLE_500,
  DEEP_PURPLE_500,
  INDIGO_500,
  CYAN_500,
  LIGHT_BLUE_500,
  TEAL_500,
  GREEN_500,
  LIGHT_GREEN_500,
  LIME_500,
  YELLOW_500,
  AMBER_500,
  ORANGE_500,
  DEEP_ORANGE_500,
} from '@/constants';
import { UIStyle } from '@/mixins/default-styles';

const onChange = (e: any) => {
  ipcRenderer.send(`edit-tabgroup-${store.windowId}`, {
    name: store.inputRef.current.value,
    id: store.tabGroupId,
  });
};

const onColorClick = (color: string) => () => {
  ipcRenderer.send(`edit-tabgroup-${store.windowId}`, {
    color,
    id: store.tabGroupId,
  });
};

export const App = observer(() => {
  return (
    <ThemeProvider theme={{ ...store.theme }}>
      <StyledApp>
        <UIStyle />
        <Colors>
          {[
            BLUE_500,
            RED_500,
            PINK_500,
            PURPLE_500,
            DEEP_PURPLE_500,
            INDIGO_500,
            CYAN_500,
            LIGHT_BLUE_500,
            TEAL_500,
            GREEN_500,
            LIGHT_GREEN_500,
            LIME_500,
            YELLOW_500,
            AMBER_500,
            ORANGE_500,
            DEEP_ORANGE_500,
          ].map((color, key) => (
            <Color
              color={color}
              onClick={onColorClick(color)}
              key={key}
            ></Color>
          ))}
        </Colors>
      </StyledApp>
    </ThemeProvider>
  );
});
