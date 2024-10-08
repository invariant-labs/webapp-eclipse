import React, { useCallback, useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@material-ui/core'
import useStyles from './styles'
import { TextInput } from '../TextInput/TextInput'
import { NumericInput } from '../NumericInput/NumericInput'
import { ImagePicker } from '../ImagePicker/ImagePicker'

interface FormData {
  name: string
  symbol: string
  decimals: string
  supply: string
  description: string
  website: string
  twitter: string
  telegram: string
  discord: string
  image: string
}

interface ControlledTextInputProps {
  name: keyof FormData
  label: string
  control: any
  rules?: object
  multiline?: boolean
  minRows?: number
  errors: any
}

interface ControlledNumericInputProps {
  name: keyof FormData
  label: string
  control: any
  errors: any
  decimalsLimit: number
}

const ControlledTextInput: React.FC<ControlledTextInputProps> = ({
  name,
  control,
  rules,
  multiline,
  errors,
  minRows
}) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    defaultValue=''
    render={({ onChange, value, name: fieldName }: any) => (
      <TextInput
        label={fieldName}
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
const ControlledNumericInput: React.FC<ControlledNumericInputProps> = ({
  name,
  control,
  errors,
  decimalsLimit
}) => (
  <Controller
    name={name}
    control={control}
    defaultValue=''
    rules={{ required: `${name.charAt(0).toUpperCase() + name.slice(1)} is required` }}
    render={({ onChange, value, name: fieldName }: any) => (
      <NumericInput
        label={fieldName}
        value={value}
        onChange={onChange}
        error={!!errors[name]}
        errorMessage={errors[name]?.message || ''}
        decimalsLimit={decimalsLimit}
      />
    )}
  />
)

export const CreateToken: React.FC = () => {
  const classes = useStyles()
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitted },
    watch,
    clearErrors,
    trigger
  } = useForm<FormData>({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  const supply = watch('supply')
  const decimals = watch('decimals')

  const MAX_VALUE = useMemo(() => BigInt(2) ** BigInt(64) - BigInt(1), [])

  const validateSupplyAndDecimals = useCallback(
    (supply: string, decimals: string): string | null => {
      if (!supply || !decimals) return null

      const supplyValue = BigInt(supply)
      const decimalsValue = parseInt(decimals, 10)

      if (decimalsValue > 20) {
        return 'Decimals cannot exceed 20'
      }

      if (supplyValue === 0n || decimalsValue === 0) {
        return null
      }

      const totalDigits = supply.length + decimalsValue
      if (totalDigits > 20) {
        return '(Supply * 10^decimal) must be less than or equal to (2^64) - 1'
      }

      if (totalDigits === 20) {
        const result = supplyValue * BigInt(10) ** BigInt(decimalsValue)
        return result <= MAX_VALUE
          ? null
          : '(Supply * 10^decimal) must be less than or equal to (2^64) - 1'
      }

      return null
    },
    [MAX_VALUE]
  )

  const debouncedValidation = useCallback(
    (supply: string, decimals: string) => {
      const timeoutId = setTimeout(() => {
        if (isSubmitted) {
          const validationResult = validateSupplyAndDecimals(supply, decimals)
          if (validationResult) {
            setError('supply', { type: 'manual', message: validationResult })
            setError('decimals', { type: 'manual', message: validationResult })
          } else {
            clearErrors(['supply', 'decimals'])
          }
          void trigger(['supply', 'decimals'])
        }
      }, 300)

      return () => clearTimeout(timeoutId)
    },
    [setError, clearErrors, validateSupplyAndDecimals, trigger, isSubmitted]
  )

  useEffect(() => {
    const cleanup = debouncedValidation(supply, decimals)
    return cleanup
  }, [supply, decimals, debouncedValidation])

  const onSubmit = useCallback(
    (data: FormData) => {
      const validationResult = validateSupplyAndDecimals(data.supply, data.decimals)
      if (validationResult) {
        setError('supply', { type: 'manual', message: validationResult })
        setError('decimals', { type: 'manual', message: validationResult })
        return
      }
      try {
        console.log(data)
      } catch (error) {
        console.error('Error submitting form:', error)
      }
    },
    [validateSupplyAndDecimals, setError]
  )

  return (
    <div className={classes.pageWrapper}>
      <div className={classes.creatorMainContainer}>
        <div className={classes.column}>
          <h1 className={classes.headerTitle}>Create token</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={classes.row}>
              <div className={classes.container}>
                <div className={classes.collumnInput}>
                  <ControlledTextInput
                    name='name'
                    label='Name'
                    control={control}
                    errors={errors}
                    rules={{ required: 'Name is required' }}
                  />
                  <ControlledTextInput
                    name='symbol'
                    label='Ticker/Symbol'
                    control={control}
                    errors={errors}
                    rules={{ required: 'Symbol is required' }}
                  />
                  <div className={classes.row}>
                    <ControlledNumericInput
                      name='decimals'
                      label='Decimals'
                      control={control}
                      errors={errors}
                      decimalsLimit={3}
                    />
                    <ControlledNumericInput
                      name='supply'
                      label='Supply'
                      control={control}
                      errors={errors}
                      decimalsLimit={0}
                    />
                  </div>
                  <Button className={classes.button} variant='contained' type='submit'>
                    <span className={classes.buttonText}>Create Token</span>
                  </Button>
                </div>
              </div>
              <div className={classes.container}>
                <div className={classes.column}>
                  <ImagePicker control={control} />
                  <ControlledTextInput
                    name='description'
                    label='Description'
                    errors={errors}
                    control={control}
                    multiline
                    minRows={3}
                  />
                  <ControlledTextInput
                    name='website'
                    label='Website'
                    control={control}
                    errors={errors}
                  />
                  <ControlledTextInput
                    errors={errors}
                    name='twitter'
                    label='X (formerly Twitter)'
                    control={control}
                  />
                  <ControlledTextInput
                    name='telegram'
                    label='Telegram'
                    control={control}
                    errors={errors}
                  />
                  <ControlledTextInput
                    name='discord'
                    label='Discord'
                    control={control}
                    errors={errors}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
