import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Button, IconType} from '@aragon/ods';

import ModalBottomSheetSwitcher from 'src/components/ModalBottomSheetSwitcher';

type Props = {
  show: boolean;
  onClose: () => void;
  onAccept: () => void;
};

const CookiePreferenceMenu: React.FC<Props> = ({show, onClose, onAccept}) => {
  const {t} = useTranslation();

  return (
    <ModalBottomSheetSwitcher
      isOpen={show}
      onClose={onClose}
      onOpenAutoFocus={e => e.preventDefault()}
    >
      <ModalHeader>
        <Title>{t('cookiePreferences.title')}</Title>
        <Button
          variant="tertiary"
          size="sm"
          iconLeft={IconType.CLOSE}
          onClick={onClose}
        />
      </ModalHeader>
      <BottomSheetContentContainer>
        <Text>{t('cookiePreferences.content')}</Text>
        <div className="flex space-x-4">
          <Button
            className="flex-1"
            variant="primary"
            size="lg"
            onClick={onAccept}
          >
            {t('cookiePreferences.accept')}
          </Button>
          <Button
            className="flex-1"
            size="lg"
            variant="tertiary"
            onClick={onClose}
          >
            {t('cookiePreferences.cancel')}
          </Button>
        </div>
      </BottomSheetContentContainer>
    </ModalBottomSheetSwitcher>
  );
};

export default CookiePreferenceMenu;

const Title = styled.div.attrs({
  className: 'flex-1 font-semibold text-neutral-800',
})``;

const ModalHeader = styled.div.attrs({
  className:
    'flex items-center p-4 space-x-4 bg-neutral-0 rounded-xl sticky top-0',
})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const BottomSheetContentContainer = styled.div.attrs({
  className: 'py-6 px-4 space-y-6 md:w-[448px]',
})``;

const Text = styled.div.attrs({
  className: 'flex-1 xl:text-sm leading-normal text-neutral-600',
})``;
