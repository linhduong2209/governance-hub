import {render, screen} from '@testing-library/react';
import React from 'react';
import {Option} from './button';
import {ButtonGroup} from './buttonGroup';

describe('Button Group', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(
      <ButtonGroup defaultValue="USD" {...args}>
        <Option value="USD" label="USD" />
        <Option value="ETH" label="ETH" />
      </ButtonGroup>
    );
    return screen.getByTestId('buttonGroup');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
