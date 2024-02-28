import React from 'react';
import {styled} from 'styled-components';

import {ProgressStatus, type ProgressStatusProps} from '../progress/status';

export type WidgetStatusProps = {
  /**
   * The widget status displays the status of a process. Such an process
   * typically consists of a number of steps. Each of these steps has a set of
   * attributes (see `ProgressStatusProps`). These attributes must be passed as
   * an array of objects.
   */
  steps: ProgressStatusProps[];
};

export const WidgetStatus: React.FC<WidgetStatusProps> = ({steps}) => {
  return (
    <Card data-testid="widgetStatus">
      <Header>Status</Header>

      {steps.length > 0 ? (
        steps.map(s => {
          return <ProgressStatus key={s.label + s.mode} {...s} />;
        })
      ) : (
        <p className="text-neutral-400">Progress unavailable</p>
      )}
    </Card>
  );
};

const Card = styled.div.attrs(() => {
  const baseClasses = 'bg-neutral-0 rounded-xl pt-6 pb-8 space-y-4';
  const bpClasses = ' px-4  md:px-6';
  return {className: baseClasses + bpClasses};
})``;

const Header = styled.p.attrs({
  className: 'font-semibold ft-text-xl text-neutral-800',
})``;
