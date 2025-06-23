import React from 'react'
import { Box } from '@mui/system'
import { Typography } from '@mui/material'
import useStyles from './style'

interface ITransactionDetails {
  tokenFromTicker: string
  tokenToTicker: string
  tokenToAmount: string
}

const TransactionDetails: React.FC<ITransactionDetails> = ({
  tokenFromTicker,
  tokenToTicker,
  tokenToAmount
}) => {
  const { classes } = useStyles()

  return (
    <Box className={classes.wrapper}>
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography className={classes.label}>Exchange rate</Typography>
        <Typography className={classes.value}>
          1 {tokenFromTicker} = {tokenToAmount} {tokenToTicker}
        </Typography>
      </Box>
      <Box display='flex' justifyContent='space-between' alignItems='center' mt='16px'>
        <Typography className={classes.label}>Fees</Typography>
        <Typography className={classes.value}>Free</Typography>
      </Box>
    </Box>
  )
}

export default TransactionDetails
