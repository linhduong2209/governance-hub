import React, {ReactNode} from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import {Dropdown, ListItemProps} from 'src/@aragon/ods-old';
import {Button, AlertInline, Icon, IconType} from '@aragon/ods';
import styled from 'styled-components';
import {shortenAddress} from 'src/utils/library';

export type AccordionType = 'action-builder' | 'execution-widget';

export type AccordionMethodType = {
  type: AccordionType;
  methodName: string;
  smartContractName?: string;
  smartContractAddress?: string;
  blockExplorerLink?: string;
  verified?: boolean;
  alertLabel?: string;
  methodDescription?: string | React.ReactNode;
  additionalInfo?: string;
  dropdownItems?: ListItemProps[];
  customHeader?: React.ReactNode;
  children: ReactNode;
};

export const AccordionMethod: React.FC<AccordionMethodType> = ({
  children,
  ...props
}) => (
  <Accordion.Root type="single" collapsible defaultValue="item-2">
    <AccordionItem name="item-2" {...props}>
      {children}
    </AccordionItem>
  </Accordion.Root>
);

export const AccordionMultiple: React.FC<{
  defaultValue: string;
  className?: string;
  children: ReactNode;
}> = ({defaultValue, className, children}) => (
  <Accordion.Root
    type="single"
    defaultValue={defaultValue}
    collapsible
    className={className}
  >
    {children}
  </Accordion.Root>
);

export const AccordionItem: React.FC<AccordionMethodType & {name: string}> = ({
  type,
  name,
  methodName,
  smartContractName,
  smartContractAddress,
  blockExplorerLink,
  verified = false,
  alertLabel,
  methodDescription,
  additionalInfo,
  dropdownItems = [],
  customHeader,
  children,
}) => (
  <Accordion.Item value={name}>
    {!customHeader ? (
      <AccordionHeader type={type}>
        <HStack>
          <FlexContainer>
            <MethodName>{methodName}</MethodName>
            {smartContractName && (
              <a
                href={blockExplorerLink}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center ${
                  verified ? 'text-primary-600' : 'text-warning-600'
                }`}
              >
                {smartContractAddress && (
                  <p className="mr-4 text-neutral-600">
                    {shortenAddress(smartContractAddress)}
                  </p>
                )}
                {verified ? (
                  <Icon icon={IconType.SUCCESS} />
                ) : (
                  <Icon icon={IconType.WARNING} />
                )}
                <p
                  className={`ml-2 font-semibold ${
                    verified ? 'text-primary-500' : 'text-warning-500'
                  }`}
                >
                  {smartContractName}
                </p>
              </a>
            )}
            {alertLabel && <AlertInline message={alertLabel} variant="info" />}
          </FlexContainer>

          <VStack>
            {type === 'action-builder' && (
              <Dropdown
                side="bottom"
                align="end"
                listItems={dropdownItems}
                disabled={dropdownItems.length === 0}
                trigger={
                  <Button
                    variant="tertiary"
                    size="md"
                    iconLeft={IconType.DOTS_VERTICAL}
                  />
                }
              />
            )}
            <Accordion.Trigger asChild>
              <AccordionButton
                variant={type === 'action-builder' ? 'tertiary' : 'secondary'}
                size="md"
                iconLeft={IconType.CHEVRON_DOWN}
              />
            </Accordion.Trigger>
          </VStack>
        </HStack>

        {methodDescription && (
          <AdditionalInfoContainer>
            <p className="md:pr-20">{methodDescription}</p>

            {additionalInfo && (
              <AlertInline message={additionalInfo} variant="info" />
            )}
          </AdditionalInfoContainer>
        )}
      </AccordionHeader>
    ) : (
      <>{customHeader}</>
    )}

    <Accordion.Content>{children}</Accordion.Content>
  </Accordion.Item>
);

const AccordionHeader = styled(Accordion.Header).attrs<{type: AccordionType}>(
  ({type}) => ({
    className: `p-4 md:px-6 rounded-xl border border-neutral-100 ${
      type === 'action-builder' ? 'bg-neutral-0' : 'bg-neutral-50'
    }`,
  })
)<{type: AccordionType}>`
  &[data-state='open'] {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    border-color: #e4e7eb;
  }
`;

const AccordionButton = styled(Button)`
  [data-state='open'] & {
    transform: rotate(180deg);
    background-color: #cbd2d9;
  }
`;

const AdditionalInfoContainer = styled.div.attrs({
  className: 'mt-3 ft-text-sm text-neutral-600 space-y-3',
})`
  [data-state='closed'] & {
    display: none;
  }
`;

const FlexContainer = styled.div.attrs({
  className: 'md:flex flex-1 justify-between items-center space-y-1 ft-text-sm',
})``;

const MethodName = styled.p.attrs({
  className: 'font-semibold ft-text-lg text-neutral-800',
})``;

const HStack = styled.div.attrs({
  className: 'flex justify-between space-x-6',
})``;

const VStack = styled.div.attrs({
  className: 'flex items-start space-x-2',
})``;
