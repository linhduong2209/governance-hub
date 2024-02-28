import {render, screen} from '@testing-library/react';
import React from 'react';
import {CheckboxListItem} from './checkboxListItem';

describe('CheckboxListItem', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<CheckboxListItem {...args} />);
    return screen.getByTestId('checkboxListItem');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
