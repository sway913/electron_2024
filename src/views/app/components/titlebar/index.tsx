import { observer } from 'mobx-react-lite';
import * as React from 'react';

import store from '@/store';
import { WindowsControls } from 'react-windows-controls';
import { StyledTitlebar, FullscreenExitButton } from './style';

const onCloseClick = () => {
  console.log(`Close`);
}

const onMaximizeClick = () => {
  console.log(`Maximize`);
}

const onMinimizeClick = () => {
  console.log(`Minimize`);
}

const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
  console.log(`MouseDown`);
};


export const Titlebar = observer(() => {
  return (
    <StyledTitlebar
      onMouseDown={onMouseDown}
    >
      {
        (
          <WindowsControls
            style={{
              height: '100%',
              WebkitAppRegion: 'no-drag',
              marginLeft: 8,
            }}
            onClose={onCloseClick}
            onMinimize={onMinimizeClick}
            onMaximize={onMaximizeClick}
            dark={store.theme['toolbar.lightForeground']}
          />
        )}
    </StyledTitlebar>
  );
});
