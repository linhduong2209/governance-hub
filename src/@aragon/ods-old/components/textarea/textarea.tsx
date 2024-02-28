import {type TextareaHTMLAttributes} from 'react';
import {styled} from 'styled-components';

export type TextareaSimpleProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className'
>;

export const TextareaSimple = styled.textarea.attrs({
  className: `py-3 px-4 rounded-xl resize-none w-full border-2 border-neutral-100 hover:border-neutral-300
    disabled:bg-neutral-100 disabled:border-neutral-200 focus-within:border-primary-500 focus-within:hover:border-primary-500 focus:outline-none bg-neutral-0 text-neutral-600 active:border-primary-500`,
})`
  min-height: 144px;

  ::-webkit-input-placeholder {
    color: #9aa5b1;
  }
  ::-moz-placeholder {
    color: #9aa5b1;
  }
  :-ms-input-placeholder {
    color: #9aa5b1;
  }
  :-moz-placeholder {
    color: #9aa5b1;
  }
`;
