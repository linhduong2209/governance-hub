import React from 'react';
import {styled} from 'styled-components';

export interface CardTextProps {
  type: 'title' | 'label';
  title: string;
  content: string;
  bgWhite?: boolean;
}

export const CardText: React.FC<CardTextProps> = ({
  type,
  title,
  content,
  bgWhite = false,
}) => {
  return (
    <Container data-testid="card-text" bgWhite={bgWhite}>
      <Title type={type}>{title}</Title>
      <p>{content}</p>
    </Container>
  );
};

type ContainerProps = Pick<CardTextProps, 'bgWhite'>;

const Container = styled.div.attrs<ContainerProps>(({bgWhite}) => {
  const className = `${
    !bgWhite && 'bg-neutral-0'
  } break-words p-4 md:p-6 rounded-xl space-y-2 text-neutral-600`;
  return {className};
})<ContainerProps>``;

type TitleProps = Pick<CardTextProps, 'type'>;

const Title = styled.p.attrs<TitleProps>(({type}) => {
  const className = `${
    type === 'label'
      ? 'ft-text-sm  text-neutral-500'
      : 'ft-text-base text-neutral-800'
  } font-semibold`;
  return {className};
})<TitleProps>``;
