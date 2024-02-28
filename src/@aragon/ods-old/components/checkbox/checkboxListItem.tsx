import React from 'react';
import {styled} from 'styled-components';
import {
  IconCheckboxDefault,
  IconCheckboxMulti,
  IconCheckboxSelected,
  IconRadioDefault,
  IconRadioSelected,
} from '../icons';

export const Icons = {
  multiSelect: {
    active: <IconCheckboxSelected />,
    multi: <IconCheckboxMulti />,
    default: <IconCheckboxDefault />,
    error: <IconCheckboxDefault />,
  },
  radio: {
    active: <IconRadioSelected />,
    multi: <IconRadioDefault />,
    default: <IconRadioDefault />,
    error: <IconRadioDefault />,
  },
};

export type CheckboxListItemProps = {
  label: string;
  helptext?: string;
  disabled?: boolean;
  multiSelect?: boolean;
  type?: 'default' | 'error' | 'active' | 'multi';
  onClick?: React.MouseEventHandler;
};

export const CheckboxListItem: React.FC<CheckboxListItemProps> = ({
  label,
  helptext,
  multiSelect = false,
  disabled = false,
  type = 'default',
  onClick,
}) => {
  return (
    <Container
      data-testid="checkboxListItem"
      type={type}
      disabled={disabled}
      {...(disabled ? {} : {onClick})}
    >
      <HStack disabled={disabled} type={type}>
        <p className="font-semibold">{label}</p>
        {Icons[multiSelect ? 'multiSelect' : 'radio'][type]}
      </HStack>
      {helptext && <Helptext>{helptext}</Helptext>}
    </Container>
  );
};

type ContainerTypes = {
  disabled: boolean;
  type: CheckboxListItemProps['type'];
};

const Container = styled.div.attrs<ContainerTypes>(({disabled, type}) => ({
  className: `py-3 px-4 rounded-xl border-2 focus:outline-none focus-visible:ring focus-visible:ring-primary ${
    disabled
      ? 'bg-neutral-100 border-neutral-300'
      : `bg-neutral-0 group hover:border-primary-500 cursor-pointer ${
          type === 'error'
            ? 'border-critical-500'
            : type !== 'default'
            ? 'border-primary-500'
            : 'border-neutral-100'
        }`
  }`,
  tabIndex: disabled ? -1 : 0,
}))<ContainerTypes>``;

const HStack = styled.div.attrs<ContainerTypes>(({disabled, type}) => ({
  className: `flex justify-between items-center group-hover:text-primary-500 space-x-3 ${
    disabled
      ? 'text-neutral-600'
      : type === 'default' || type === 'error'
      ? 'text-neutral-600'
      : 'text-primary-500'
  }`,
}))<ContainerTypes>``;

const Helptext = styled.p.attrs({
  className: 'ft-text-sm text-neutral-500 mt-0.5 mr-7',
})``;
