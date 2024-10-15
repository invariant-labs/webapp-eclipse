import React from 'react'
import { useForm } from 'react-hook-form'
import useStyles from './styles'
import { validateDecimals, validateSupply } from '../../utils/solanaCreatorUtils'
import { TokenInfoInputs } from '../CreatorComponents/TokenInfoInputs'
import { Box, Typography } from '@mui/material'

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
  const { classes } = useStyles()

  const formMethods = useForm<FormData>({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })
  const onSubmit = (data: FormData) => {
    try {
      const decimalsError = validateDecimals(data.decimals)
      if (decimalsError) {
        throw new Error(decimalsError)
      }

      const supplyError = validateSupply(data.supply, data.decimals)
      if (supplyError) {
        throw new Error(supplyError)
      }

      console.log(data)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

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
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  )
}
