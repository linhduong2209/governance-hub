import React, {useRef} from 'react';
import {styled} from 'styled-components';

import {Button, IconType} from '@aragon/ods';

export type NumberInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Changes a input's color schema */
  mode?: 'default' | 'success' | 'warning' | 'critical';
  /**
   * change the input view with corresponding symbols
   */
  view?: 'default' | 'percentage' | 'bigger';
  disabled?: boolean;
  width?: number;
  value: string;
  disableIncrement?: boolean;
  disableDecrement?: boolean;
  /** Determines whether decimal values are accepted */
  includeDecimal?: boolean;
};

export const NumberInput: React.FC<NumberInputProps> = ({
  mode = 'default',
  view = 'default',
  disabled,
  disableDecrement,
  disableIncrement,
  width,
  value,
  includeDecimal,
  onChange,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStepperChange = (mode: 'up' | 'down') => {
    mode === 'up' ? inputRef.current?.stepUp() : inputRef.current?.stepDown();

    // For Calling th onChange Function
    inputRef.current?.dispatchEvent(new Event('input', {bubbles: true}));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!includeDecimal && event.key === '.') {
      event?.preventDefault();
    } else {
      props.onKeyDown?.(event);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // this handles pasting in the value/ could also use onPaste event
    if (!includeDecimal) {
      event.target.value = event.target.value.replace(/[^-0-9]/g, '');
    }

    onChange?.(event);
  };

  // input width based on view
  const inputWidth: {
    [value: string]: string;
  } = {
    bigger: 'w-16',
    percentage: 'w-7',
    default: 'w-full',
  };

  // input placeholder based on view
  const placeholder: {
    [value: string]: string;
  } = {
    bigger: '≥0',
    percentage: '0%',
    default: '0',
  };

  // input range based on view
  const inputRange: {
    [value: string]: {
      min?: number;
      max?: number;
    };
  } = {
    bigger: {
      min: 0,
    },
    percentage: {
      min: 0,
      max: 100,
    },
    default: {},
  };

  return (
    <Container data-testid="number-input" {...{mode, disabled, width}}>
      <StyledIconButton
        name="down"
        variant="tertiary"
        size="sm"
        iconLeft={IconType.MINUS}
        state={disabled ?? disableDecrement ? 'disabled' : undefined}
        onClick={() => handleStepperChange('down')}
      />
      <InputWrapper>
        {view === 'bigger' && value !== '' && (
          <LeftAdornment disabled={disabled}>≥</LeftAdornment>
        )}
        <StyledNumberInput
          {...props}
          {...{value}}
          {...inputRange[view]}
          inputWidth={inputWidth[view]}
          ref={inputRef}
          disabled={disabled}
          type="number"
          placeholder={placeholder[view]}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onWheel={e => {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }}
        />
        {view === 'percentage' && value !== '' && (
          <Percent disabled={disabled}>%</Percent>
        )}
      </InputWrapper>
      <StyledIconButton
        name="up"
        variant="tertiary"
        size="sm"
        iconLeft={IconType.PLUS}
        state={disabled ?? disableIncrement ? 'disabled' : undefined}
        onClick={() => handleStepperChange('up')}
      />
    </Container>
  );
};

export type StyledContainerProps = Pick<
  NumberInputProps,
  'mode' | 'disabled' | 'width'
>;

const Container = styled.div.attrs<StyledContainerProps>(
  ({mode, disabled, width}) => {
    let className = `${
      disabled ? 'bg-neutral-100' : 'bg-neutral-0'
    } inline-flex bg-neutral-0 ${
      width ? '' : 'w-full'
    } focus:outline-none items-center py-1.5 px-2
      focus-within:border-primary-500 focus-within:hover:border-primary-500 justify-between
      rounded-xl hover:border-neutral-300 border-2 active:border-primary-500
    `;

    if (mode === 'default') {
      className += 'border-neutral-100';
    } else if (mode === 'success') {
      className += 'border-success-600';
    } else if (mode === 'warning') {
      className += 'border-warning-600';
    } else if (mode === 'critical') {
      className += 'border-critical-600';
    }

    return {
      className,
      ...(width && {style: {width: `${width}px`}}),
    };
  }
)<StyledContainerProps>``;
const InputWrapper = styled.div.attrs({
  className: 'flex justify-center w-4/5',
})``;

export type StyledNumberInputProps = Pick<NumberInputProps, 'disabled'> & {
  inputWidth: string;
};

export type PercentProps = Pick<NumberInputProps, 'disabled'>;

const Percent = styled.label.attrs<PercentProps>(({disabled}) => {
  const className: string | undefined = `${
    disabled ? 'text-neutral-300' : 'text-neutral-600'
  }`;
  return {
    className,
  };
})<PercentProps>``;

const LeftAdornment = styled.label.attrs<PercentProps>(({disabled}) => {
  const className: string | undefined = `${
    disabled ? 'text-neutral-300' : 'text-neutral-600'
  }`;
  return {
    className,
  };
})<PercentProps>``;

const StyledNumberInput = styled.input.attrs<StyledNumberInputProps>(
  ({disabled, inputWidth}) => {
    const className: string | undefined = `${
      disabled ? 'text-neutral-300' : 'text-neutral-600'
    } bg-[transparent] margin-0 ${inputWidth}`;
    return {
      className,
    };
  }
)<StyledNumberInputProps>`
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  -moz-appearance: textfield;
  text-align: center;
  outline: 0;
`;

const StyledIconButton = styled(Button).attrs({
  className: 'rounded-lg',
})``;
