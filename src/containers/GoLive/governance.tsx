import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {Dd, DescriptionListContainer, Dl, Dt} from 'src/components/DescriptionList';
import {useFormStep} from 'src/components/FullScreenStepper';

const Governance: React.FC = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {t} = useTranslation();
  const {
    minimumApproval,
    minimumParticipation,
    tokenTotalSupply,
    tokenSymbol,
    durationMinutes,
    durationHours,
    durationDays,
    reviewCheckError,
    earlyExecution,
    voteReplacement,
    membership,
    multisigMinimumApprovals,
    multisigWallets,
    isCustomToken,
    tokenType,
    votingType,
  } = getValues();

  const isGovTokenRequiresWrapping = !isCustomToken && tokenType === 'ERC-20';

  return (
    <Controller
      name="reviewCheck.governance"
      control={control}
      defaultValue={false}
      rules={{
        required: t('errors.required.recipient'),
      }}
      render={({field: {onChange, value}}) => (
        <DescriptionListContainer
          title={t('labels.review.votingParameters')}
          onEditClick={() => setStep(5)}
          checkBoxErrorMessage={t('createDAO.review.acceptContent')}
          checkedState={
            value ? 'active' : reviewCheckError ? 'error' : 'default'
          }
          tagLabel={t('labels.changeableVote')}
          onChecked={() => onChange(!value)}
        >
          {membership === 'multisig' && (
            <Dl>
              <Dt>{t('labels.minimumApproval')}</Dt>
              <Dd>
                {t('labels.review.multisigMinimumApprovals', {
                  count: multisigMinimumApprovals,
                  total: multisigWallets.length,
                })}
              </Dd>
            </Dl>
          )}
          {membership === 'token' && (
            <>
              <Dl>
                <Dt>{t('labels.supportThreshold')}</Dt>
                <Dd>&gt;{parseInt(minimumApproval)}%</Dd>
              </Dl>
              <Dl>
                <Dt>{t('labels.minimumParticipation')}</Dt>
                <Dd>
                  {'≥'}
                  {minimumParticipation}%
                  {!isGovTokenRequiresWrapping && (
                    <span>
                      (
                      {Math.ceil(tokenTotalSupply * (value / 100)) <
                      tokenTotalSupply
                        ? '≥'
                        : ''}
                      {Math.ceil(
                        tokenTotalSupply * (minimumParticipation / 100)
                      )}{' '}
                      {tokenSymbol})
                    </span>
                  )}
                </Dd>
              </Dl>
              <Dl>
                <Dt>{t('labels.minimumDuration')}</Dt>
                <Dd>
                  <div className="flex space-x-3">
                    <div>
                      {t('createDAO.review.days', {days: durationDays})}
                    </div>
                    <div>
                      {t('createDAO.review.hours', {hours: durationHours})}
                    </div>
                    <div>
                      {t('createDAO.review.minutes', {
                        minutes: durationMinutes,
                      })}
                    </div>
                  </div>
                </Dd>
              </Dl>
              {votingType === 'onChain' && (
                <>
                  <Dl>
                    <Dt>{t('labels.earlyExecution')}</Dt>
                    <Dd>{earlyExecution ? t('labels.yes') : t('labels.no')}</Dd>
                  </Dl>
                  <Dl>
                    <Dt>{t('labels.voteReplacement')}</Dt>
                    <Dd>
                      {voteReplacement ? t('labels.yes') : t('labels.no')}
                    </Dd>
                  </Dl>{' '}
                </>
              )}
            </>
          )}
        </DescriptionListContainer>
      )}
    />
  );
};

export default Governance;
