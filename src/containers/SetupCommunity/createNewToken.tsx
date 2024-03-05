import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Controller, useFormContext} from 'react-hook-form';
import AddWallets from 'src/components/AddWallets';
import {alphaNumericValidator} from 'src/utils/validators';
import {htmlIn} from 'src/utils/htmlIn';
import {Label, TextInput} from 'src/@aragon/ods-old';
import {AlertInline} from '@aragon/ods';

const CreateNewToken: React.FC = () => {
  const {t} = useTranslation();
  const {control} = useFormContext();

  return (
    <>
      <DescriptionContainer>
        <Title>{t('labels.mintToken')}</Title>
        <Subtitle
          dangerouslySetInnerHTML={{
            __html: htmlIn(t)('createDAO.step3.createTokenHelptext'),
          }}
        ></Subtitle>
      </DescriptionContainer>
      <FormItem>
        <Label
          label={t('labels.tokenName')}
          helpText={t('createDAO.step3.nameSubtitle')}
        />

        <Controller
          name="tokenName"
          control={control}
          defaultValue=""
          rules={{
            required: t('errors.required.tokenName') as string,
            validate: value =>
              alphaNumericValidator(value, t('errors.fields.tokenName')),
          }}
          render={({
            field: {onBlur, onChange, value, name},
            fieldState: {error},
          }) => (
            <>
              <TextInput
                name={name}
                value={value}
                onBlur={onBlur}
                onChange={onChange}
              />
              {error?.message && (
                <AlertInline message={error.message} variant="critical" />
              )}
            </>
          )}
        />
      </FormItem>
      <FormItem>
        <Label
          label={t('labels.tokenSymbol')}
          helpText={t('createDAO.step3.symbolSubtitle')}
        />

        <Controller
          name="tokenSymbol"
          control={control}
          defaultValue=""
          rules={{
            required: t('errors.required.tokenSymbol') as string,
            validate: value =>
              alphaNumericValidator(value, t('errors.fields.tokenSymbol')),
          }}
          render={({
            field: {onBlur, onChange, value, name},
            fieldState: {error},
          }) => (
            <>
              <TextInput
                name={name}
                value={value}
                onBlur={onBlur}
                onChange={onChange}
              />
              {error?.message && (
                <AlertInline message={error.message} variant="critical" />
              )}
            </>
          )}
        />
      </FormItem>
      <FormItem>
        <DescriptionContainer>
          <Label
            label={t('labels.distributeTokens')}
            helpText={htmlIn(t)('createDAO.step3.distributeTokensHelpertext')}
            renderHtml={true}
          />
        </DescriptionContainer>
        <AlertInline
          message={t('createDAO.step3.distributionWalletAlertText')}
          variant="info"
        />
        <AddWallets />
      </FormItem>
    </>
  );
};

export default CreateNewToken;

const FormItem = styled.div.attrs({
  className: 'space-y-3',
})``;

const DescriptionContainer = styled.div.attrs({
  className: 'space-y-1',
})``;

const Title = styled.p.attrs({
  className: 'text-xl leading-normal font-semibold text-neutral-800',
})``;

const Subtitle = styled.p.attrs({className: 'text-neutral-600 text-bold'})``;
