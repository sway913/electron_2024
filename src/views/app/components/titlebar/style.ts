import styled, { css } from 'styled-components';
import { ITheme } from '@/interfaces/theme';
import { ICON_FULLSCREEN_EXIT } from '@/constants/icons'
import { centerIcon } from '@/mixins';


export const StyledTitlebar = styled.div`
  position: relative;
  z-index: 100;
  display: flex;
  flex-flow: row;
  color: rgba(0, 0, 0, 0.8);
  width: 100%;

  &:before {
    position: absolute;
    z-index: 0;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 0px;
    content: '';
  }

  ${({
  theme,
}: {
  theme: ITheme;
}) => css`
    background-color: ${theme?.['titlebar.backgroundColor']};
    height: ${theme.titlebarHeight}px;
    align-items: ${theme.isCompact ? 'center' : 'initial'};
    padding-left: 4px;

    &:before {
      -webkit-app-region: 'drag';
    }
  `};
`;

export const FullscreenExitButton = styled.div`
  top: 0;
  right: 0;
  height: 32px;
  min-width: 45px;
  -webkit-app-region: no-drag;
  marginLeft: 8;
  background-image: url(${ICON_FULLSCREEN_EXIT});
  transition: 0.1s background-color;
  ${centerIcon(24)};

  ${({ theme }: { theme?: ITheme }) => css`
    filter: ${theme?.['dialog.lightForeground']
      ? `invert(100%)`
      : `none`};
  `}

  &:hover {
    background-color: rgba(60, 60, 60, 0.4);
  }
`;