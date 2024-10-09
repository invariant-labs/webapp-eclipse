import React from 'react'
import { useForm } from 'react-hook-form'
import { Box, Typography } from '@material-ui/core'
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

  return (
    <Box className={classes.pageWrapper}>
      <Box className={classes.creatorMainContainer}>
        <Box className={classes.column}>
          <Typography variant='h1' className={classes.headerTitle}>
            Create token
          </Typography>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <Box className={classes.row}>
              <TokenInfoInputs formMethods={formMethods} />
              <TokenMetadataInputs formMethods={formMethods} />
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  )
}
