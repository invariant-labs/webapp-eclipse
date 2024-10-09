import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { ControlledTextInput, ControlledNumericInput } from './ControlledInputs'
import { FormData, validateSupplyAndDecimals } from '../../utils/solanaCreatorUtils'
import useStyles from '../CreateToken/styles'
import { Button } from '@material-ui/core'

interface TokenInfoInputsProps {
  formMethods: UseFormReturn<FormData>
}

export const TokenInfoInputs: React.FC<TokenInfoInputsProps> = ({ formMethods }) => {
  const classes = useStyles()
  const {
    control,
    watch,

    formState: { errors, isValid }
  } = formMethods

  return (
    <div className={classes.container}>
      <div className={classes.columnInput}>
        <ControlledTextInput
          name='name'
          label='Name'
          control={control}
          errors={errors}
          rules={{
            required: 'Name is required',
            maxLength: { value: 30, message: 'Name must be 30 characters or less' }
          }}
        />
        <ControlledTextInput
          name='symbol'
          label='Ticker/Symbol'
          control={control}
          errors={errors}
          rules={{
            required: 'Symbol is required',
            maxLength: { value: 8, message: 'Symbol must be 8 characters or less' }
          }}
        />
        <div className={classes.row}>
          <ControlledNumericInput
            name='decimals'
            label='Decimals'
            control={control}
            errors={errors}
            decimalsLimit={0}
            rules={{
              validate: (value: string) => {
                const decimalValue = parseInt(value, 10)
                return (
                  (decimalValue >= 5 && decimalValue <= 9) || 'Decimals must be between 5 and 9'
                )
              }
            }}
          />
          <ControlledNumericInput
            name='supply'
            label='Supply'
            control={control}
            errors={errors}
            decimalsLimit={0}
            rules={{
              required: 'Supply is required',
              validate: (value: string) => validateSupplyAndDecimals(value, watch('decimals'))
            }}
          />
        </div>
        <Button className={classes.button} variant='contained' type='submit' disabled={!isValid}>
          <span className={classes.buttonText}>Create Token</span>
        </Button>
      </div>
    </div>
  )
}
