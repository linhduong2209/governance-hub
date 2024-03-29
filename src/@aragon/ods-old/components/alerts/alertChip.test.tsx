import {render, screen} from '@testing-library/react';
import React from 'react';
import {AlertChip} from './alertChip';

describe('AlertChip', () => {
  // eslint-disable-next-line
  function setup(args: any) {
    render(<AlertChip {...args} />);
    return screen.getByTestId('alertChip');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
