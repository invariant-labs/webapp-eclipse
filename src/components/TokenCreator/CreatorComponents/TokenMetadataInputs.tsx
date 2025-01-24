import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { ControlledTextInput } from './ControlledInputs'
import { ImagePicker } from '../ImagePicker/ImagePicker'
import { Box } from '@mui/material'
import useStyles from './styles'
import { validateSocialLink } from '@utils/tokenCreatorUtils'
import { FormData } from '@store/consts/tokenCreator/types'

interface TokenMetadataInputsProps {
  formMethods: UseFormReturn<FormData>
}

export const TokenMetadataInputs: React.FC<TokenMetadataInputsProps> = ({ formMethods }) => {
  const { classes } = useStyles()
  const {
    control,
    formState: { errors }
  } = formMethods

  return (
    <Box className={classes.container}>
      <Box className={classes.column}>
        <ImagePicker control={control} />
        <ControlledTextInput
          name='description'
          label='Description'
          placeholder='Tell us something about your token...'
          errors={errors}
          control={control}
          multiline
          maxRows={3}
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
          rules={{ validate: (value: string) => validateSocialLink(value, 'website') }}
        />
        <ControlledTextInput
          errors={errors}
          name='twitter'
          label='X (formerly Twitter)'
          control={control}
          rules={{ validate: (value: string) => validateSocialLink(value, 'x') }}
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
      </Box>
    </Box>
  )
}
