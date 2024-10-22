import React, { useEffect, useMemo, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { ControlledTextInput, ControlledNumericInput } from './ControlledInputs'
import { FormData, validateSupply } from '../../utils/solanaCreatorUtils'
import useStyles from '../CreateToken/styles'
import { Box, Button, Typography } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import { openWalletSelectorModal } from '@utils/web3/selector'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import AnimatedButton, { ProgressState } from '@components/AnimatedButton/AnimatedButton'
import { BN } from '@project-serum/anchor'
import classNames from 'classnames'
import { WETH_CREATE_TOKEN_LAMPORTS } from '@store/consts/static'

interface TokenInfoInputsProps {
  formMethods: UseFormReturn<FormData>
  buttonText: string
  success: boolean
  inProgress: boolean
  ethBalance: BN
}

export const TokenInfoInputs: React.FC<TokenInfoInputsProps> = ({
  formMethods,
  buttonText,
  success,
  inProgress,
  ethBalance
}) => {
  const { classes } = useStyles()
  const {
    control,
    watch,

    formState: { errors, isValid }
  } = formMethods
  const isSubmitButton = buttonText === 'Create token'
  const [progress, setProgress] = useState<ProgressState>('none')

  useEffect(() => {
    let timeoutId1: NodeJS.Timeout
    let timeoutId2: NodeJS.Timeout

    if (!inProgress && progress === 'progress') {
      setProgress(success ? 'approvedWithSuccess' : 'approvedWithFail')

      timeoutId1 = setTimeout(() => {
        setProgress(success ? 'success' : 'failed')
      }, 1000)

      timeoutId2 = setTimeout(() => {
        setProgress('none')
      }, 3000)
    }

    return () => {
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
    }
  }, [success, inProgress])

  const createAvailable = useMemo(() => {
    return ethBalance.gt(WETH_CREATE_TOKEN_LAMPORTS)
  }, [ethBalance])

  return (
    <Box className={classes.container}>
      <Box className={classes.inputsWrapper}>
        <ControlledTextInput
          name='name'
          label='Name (Max 30)'
          placeholder='Put the name of your token here'
          control={control}
          errors={errors}
          rules={{
            required: 'Name is required',
            maxLength: { value: 30, message: 'Name must be 30 characters or less' }
          }}
        />
        <ControlledTextInput
          name='symbol'
          label='Symbol (Max 8)'
          placeholder='Put the symbol of your token here'
          control={control}
          errors={errors}
          rules={{
            required: 'Symbol is required',
            maxLength: { value: 8, message: 'Symbol must be 8 characters or less' }
          }}
        />
        <Box className={classes.row} gap='10px'>
          <Box className={classes.inputContainer}>
            <ControlledNumericInput
              name='decimals'
              label='Decimals'
              placeholder='Decimals between 5 and 9'
              control={control}
              errors={errors}
              decimalsLimit={0}
              rules={{
                required: 'Decimals is required',
                validate: (value: string) => {
                  const decimalValue = parseInt(value, 10)
                  return (
                    (decimalValue >= 5 && decimalValue <= 9) || 'Decimals must be between 5 and 9'
                  )
                }
              }}
            />
          </Box>
          <Box className={classes.inputContainer}>
            <ControlledNumericInput
              name='supply'
              label='Supply'
              placeholder='Supply of your token'
              control={control}
              errors={errors}
              decimalsLimit={0}
              rules={{
                required: 'Supply is required',
                validate: (value: string) => validateSupply(value, watch('decimals'))
              }}
            />
          </Box>
        </Box>
      </Box>
      <Box className={classes.tokenCost}>
        <InfoIcon />
        <Typography>Token cost: ~0.01 ETH</Typography>
      </Box>

      {isSubmitButton ? (
        !createAvailable ? (
          <TooltipHover
            text='More ETH is required to cover the transaction fee. Obtain more ETH to complete this transaction.'
            top={-45}>
            <div>
              <AnimatedButton
                type='submit'
                content={'Insufficient ETH'}
                className={classes.button}
                onClick={() => {}}
                disabled={!createAvailable}
                progress={progress}
              />
            </div>
          </TooltipHover>
        ) : (
          <AnimatedButton
            type='submit'
            content={buttonText}
            disabled={!isValid}
            className={classNames(
              classes.button,
              isValid && progress === 'none' ? classes.buttonActive : null
            )}
            onClick={() => {
              setProgress('progress')
            }}
            progress={progress}
          />
        )
      ) : (
        <Button
          className={classes.connectWalletButton}
          variant='contained'
          type='button'
          onClick={openWalletSelectorModal}>
          <span className={classes.buttonText}>{buttonText}</span>
        </Button>
      )}
    </Box>
  )
}
