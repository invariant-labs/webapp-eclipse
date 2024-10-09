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
  rules?: object

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
    render={({ field: { onChange, value } }) => (
      <TextInput
        label={name}
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
  rules,
  errors,
  decimalsLimit
}) => (
  <Controller
    name={name}
    control={control}
    defaultValue=''
    rules={{ required: `${name.charAt(0).toUpperCase() + name.slice(1)} is required`, ...rules }}
    render={({ field: { onChange, value } }) => (
      <NumericInput
        label={name}
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

      if (decimalsValue < 5 || decimalsValue > 9) {
        return 'Decimals must be between 5 and 9'
      }

      if (supplyValue === 0n) {
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
          console.log('validationResult', validationResult)

          if (validationResult) {
            console.log('Setting error for supply and decimals')
            setError('supply', { type: 'manual', message: validationResult })
            setError('decimals', { type: 'manual', message: validationResult })
          } else {
            console.log('Clearing errors for supply and decimals')
            clearErrors(['supply', 'decimals'])
          }

          void trigger(['supply', 'decimals'])
        }

        console.log('Current errors:', errors)
      }, 300)

      return () => clearTimeout(timeoutId)
    },
    [setError, clearErrors, validateSupplyAndDecimals, trigger, isSubmitted, errors]
  )

  useEffect(() => {
    const cleanup = debouncedValidation(supply, decimals)
    return cleanup
  }, [supply, decimals, debouncedValidation])

  type SocialPlatform = 'twitter' | 'telegram' | 'discord'

  const validateSocialLink = (value: string, platform: SocialPlatform): true | string => {
    if (!value) return true
    const patterns: Record<SocialPlatform, RegExp> = {
      twitter: /^https?:\/\/(www\.)?twitter\.com\/.+/i,
      telegram: /^https?:\/\/(t\.me|telegram\.me)\/.+/i,
      discord: /^https?:\/\/(www\.)?discord\.gg\/.+/i
    }
    return patterns[platform].test(value) || `Invalid ${platform} link`
  }
  const validateDecimals = useCallback((value: string): string | undefined => {
    const decimalValue = parseInt(value, 10)
    if (isNaN(decimalValue) || decimalValue < 5 || decimalValue > 9) {
      return 'Decimals must be between 5 and 9'
    }
    return undefined
  }, [])
  const onSubmit = useCallback(
    (data: FormData) => {
      const validationResult = validateSupplyAndDecimals(data.supply, data.decimals)
      if (validationResult) {
        setError('supply', { type: 'manual', message: validationResult })
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
                        validate: validateDecimals
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
                        validate: (value: string) =>
                          validateSupplyAndDecimals(value, watch('decimals'))
                      }}
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
                    rules={{
                      maxLength: {
                        value: 500,
                        message: 'Description must be 500 characters or less'
                      }
                    }}
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
                    rules={{ validate: (value: string) => validateSocialLink(value, 'twitter') }}
                  />
                  <ControlledTextInput
                    name='telegram'
                    label='Telegram'
                    control={control}
                    errors={errors}
                    rules={{ validate: (value: string) => validateSocialLink(value, 'telegram') }}
                  />
                  <ControlledTextInput
                    name='discord'
                    label='Discord'
                    control={control}
                    errors={errors}
                    rules={{ validate: (value: string) => validateSocialLink(value, 'discord') }}
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
