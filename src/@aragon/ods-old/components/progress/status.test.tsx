import {render, screen} from '@testing-library/react';
import React from 'react';
import {ProgressStatus} from './status';

describe('ProgressStatus', () => {
  // eslint-disable-next-line
    function setup(args: any) {
    render(<ProgressStatus {...args} />);
    return screen.getByTestId('progressStatus');
  }

  test('should render without crashing', () => {
    const element = setup({});
    expect(element).toBeInTheDocument;
  });
});
