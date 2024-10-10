import React from 'react'
import { Controller } from 'react-hook-form'
import { TextInput } from '../TextInput/TextInput'
import { NumericInput } from '../NumericInput/NumericInput'
import getErrorMessages, { FormData } from '../../utils/solanaCreatorUtils'

interface ControlledInputProps {
  name: keyof FormData
  label: string
  control: any
  rules?: object
  errors: any
}

interface ControlledTextInputProps extends ControlledInputProps {
  multiline?: boolean
  minRows?: number
}

interface ControlledNumericInputProps extends ControlledInputProps {
  decimalsLimit: number
}

export const ControlledTextInput: React.FC<ControlledTextInputProps> = ({
  name,
  label,
  control,
  rules,
  errors,
  multiline,
  minRows
}) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    defaultValue=''
    render={({ field: { onChange, value } }) => (
      <TextInput
        label={label}
        value={value}
        handleChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        error={!!errors[name]}
        errorMessage={errors[name]?.message || ''}
        multiline={multiline}
        minRows={minRows}
      />
    )}
  />
)
export const ControlledNumericInput: React.FC<ControlledNumericInputProps> = ({
  name,
  label,
  control,
  errors,
  rules,
  decimalsLimit
}) => {
  const error = errors[name]

  const { shortErrorMessage, fullErrorMessage } = getErrorMessages(error)

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <NumericInput
          label={label}
          value={value}
          onChange={onChange}
          error={!!error}
          errorMessage={shortErrorMessage}
          fullErrorMessage={fullErrorMessage}
          decimalsLimit={decimalsLimit}
        />
      )}
    />
  )
}
