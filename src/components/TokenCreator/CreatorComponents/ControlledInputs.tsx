import React from 'react'
import { Controller } from 'react-hook-form'
import { TextInput } from '../TextInput/TextInput'
import { NumericInput } from '../NumericInput/NumericInput'
import getErrorMessages from '@utils/tokenCreatorUtils'
import { FormData } from '@store/consts/tokenCreator/types'

interface ControlledInputProps {
  name: keyof FormData
  label: string
  placeholder?: string
  control: any
  rules?: any
  errors: any
}

interface ControlledTextInputProps extends ControlledInputProps {
  multiline?: boolean
  minRows?: number
  maxRows?: number
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
  placeholder,
  minRows
}) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    defaultValue=''
    render={({ field: { onChange, value } }) => (
      <TextInput
        placeholder={placeholder ?? label}
        label={label}
        value={value}
        required={rules?.required ? rules.required : false}
        handleChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        error={!!errors[name]}
        errorMessage={errors[name]?.message || ''}
        multiline={multiline}
        minRows={minRows}
        maxRows={minRows}
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
  decimalsLimit,
  placeholder
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
          placeholder={placeholder}
          label={label}
          value={value}
          onChange={onChange}
          required={rules?.required ? rules.required : false}
          error={!!error}
          errorMessage={shortErrorMessage}
          fullErrorMessage={fullErrorMessage}
          decimalsLimit={decimalsLimit}
        />
      )}
    />
  )
}
