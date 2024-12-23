import styled, { css } from 'styled-components';
import { centerIcon } from '@/mixins';
import { ITheme } from '~/interfaces';
import { DialogStyle } from '@/mixins/dialogs';

export const StyledApp = styled(DialogStyle)`
  transition: none;
  padding-bottom: 4px;

  ${({ theme }: { theme?: ITheme }) => css`
    background-color: ${theme?.['backgroundColor']};
    color: 'rgba(255, 255, 255, 0.87)'};
  `}
`;

export const Title = styled.div`
  font-size: 16px;
`;

export const Subtitle = styled.div`
  font-size: 13px;
  opacity: 0.54;
  margin-top: 8px;
`;

export const Buttons = styled.div`
  display: flex;
  margin-top: 16px;
  float: right;
`;

export const Input = styled.input.attrs(() => ({
  spellCheck: false,
}))`
  outline: none;
  border: none;
  width: 100%;
  height: 100%;
  font-family: inherit;
  font-size: 14px;
  padding-left: 12px;
  padding-right: 8px;
  padding-top: 1px;
  background-color: transparent;
  color: inherit;
  border-radius: 20px; /* Make the textbox completely round */

  ${({ theme }: { theme?: ITheme }) => css`
    &::placeholder {
      color: ${theme?.['toolbar.lightForeground']
        ? 'rgba(255, 255, 255, 0.54)'
        : 'rgba(0, 0, 0, 0.54)'};
    }
  `}
`;

export const CurrentIcon = styled.div`
  width: 16px;
  height: 16px;
  min-width: 16px;
  ${centerIcon()};
  margin-left: 11px;
`;

export const html = styled.div`
  display: flex;
  align-items: center;

  ${({ theme }: { theme?: any }) => css`
    height: ${theme.htmlHeight}px;
  `}
`;