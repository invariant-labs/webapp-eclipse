import React from 'react'
import { useForm } from 'react-hook-form'
import useStyles from './styles'
import { TokenMetadataInputs } from '../CreatorComponents/TokenMetadataInputs'
import { onSubmit } from '../../utils/solanaCreatorUtils'
import { TokenInfoInputs } from '../CreatorComponents/TokenInfoInputs'

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

export const CreateToken: React.FC = () => {
  const classes = useStyles()

  const formMethods = useForm<FormData>({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })
  // const supply = watch('supply')
  // const decimals = watch('decimals')

  // const MAX_VALUE = useMemo(() => BigInt(2) ** BigInt(64) - BigInt(1), [])

  // const validateSupplyAndDecimals = useCallback(
  //   (supply: string, decimals: string): string | null => {
  //     if (!supply || !decimals) return null

  //     const supplyValue = BigInt(supply)
  //     const decimalsValue = parseInt(decimals, 10)

  //     if (decimalsValue < 5 || decimalsValue > 9) {
  //       return 'Decimals must be between 5 and 9'
  //     }

  //     if (supplyValue === 0n) {
  //       return null
  //     }

  //     const totalDigits = supply.length + decimalsValue
  //     if (totalDigits > 20) {
  //       return '(Supply * 10^decimal) must be less than or equal to (2^64) - 1'
  //     }

  //     if (totalDigits === 20) {
  //       const result = supplyValue * BigInt(10) ** BigInt(decimalsValue)
  //       return result <= MAX_VALUE
  //         ? null
  //         : '(Supply * 10^decimal) must be less than or equal to (2^64) - 1'
  //     }

  //     return null
  //   },
  //   [MAX_VALUE]
  // )

  // const debouncedValidation = useCallback(
  //   (supply: string, decimals: string) => {
  //     const timeoutId = setTimeout(() => {
  //       if (isSubmitted) {
  //         const validationResult = validateSupplyAndDecimals(supply, decimals)
  //         console.log('validationResult', validationResult)

  //         if (validationResult) {
  //           console.log('Setting error for supply and decimals')
  //           setError('supply', { type: 'manual', message: validationResult })
  //           setError('decimals', { type: 'manual', message: validationResult })
  //         } else {
  //           console.log('Clearing errors for supply and decimals')
  //           clearErrors(['supply', 'decimals'])
  //         }

  //         void trigger(['supply', 'decimals'])
  //       }

  //       console.log('Current errors:', errors)
  //     }, 300)

  //     return () => clearTimeout(timeoutId)
  //   },
  //   [setError, clearErrors, validateSupplyAndDecimals, trigger, isSubmitted, errors]
  // )

  // useEffect(() => {
  //   const cleanup = debouncedValidation(supply, decimals)
  //   return cleanup
  // }, [supply, decimals, debouncedValidation])

  // type SocialPlatform = 'twitter' | 'telegram' | 'discord'

  // const validateSocialLink = (value: string, platform: SocialPlatform): true | string => {
  //   if (!value) return true
  //   const patterns: Record<SocialPlatform, RegExp> = {
  //     twitter: /^https?:\/\/(www\.)?twitter\.com\/.+/i,
  //     telegram: /^https?:\/\/(t\.me|telegram\.me)\/.+/i,
  //     discord: /^https?:\/\/(www\.)?discord\.gg\/.+/i
  //   }
  //   return patterns[platform].test(value) || `Invalid ${platform} link`
  // }
  // const validateDecimals = useCallback((value: string): string | undefined => {
  //   const decimalValue = parseInt(value, 10)
  //   if (isNaN(decimalValue) || decimalValue < 5 || decimalValue > 9) {
  //     return 'Decimals must be between 5 and 9'
  //   }
  //   return undefined
  // }, [])
  // const onSubmit = useCallback(
  //   (data: FormData) => {
  //     const validationResult = validateSupplyAndDecimals(data.supply, data.decimals)
  //     if (validationResult) {
  //       setError('supply', { type: 'manual', message: validationResult })
  //       return
  //     }
  //     try {
  //       console.log(data)
  //     } catch (error) {
  //       console.error('Error submitting form:', error)
  //     }
  //   },
  //   [validateSupplyAndDecimals, setError]
  // )

  return (
    <div className={classes.pageWrapper}>
      <div className={classes.creatorMainContainer}>
        <div className={classes.column}>
          <h1 className={classes.headerTitle}>Create token</h1>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div className={classes.row}>
              <TokenInfoInputs formMethods={formMethods} />
              <TokenMetadataInputs formMethods={formMethods} />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
