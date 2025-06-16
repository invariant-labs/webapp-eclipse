import React from 'react'
import { Box } from '@mui/system'
import { Typography } from '@mui/material'
import useStyles from './style'

interface ITransactionDetails {}

const TransactionDetails: React.FC<ITransactionDetails> = () => {
  const { classes } = useStyles()

  return (
    <Box className={classes.wrapper}>
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography className={classes.label}>Exchange rate</Typography>
        <Typography className={classes.value}>1 sBITZ = {1.123} BITZ</Typography>
      </Box>
      <Box display='flex' justifyContent='space-between' alignItems='center' mt='16px'>
        <Typography className={classes.label}>Fees</Typography>
        <Typography className={classes.value}>Free</Typography>
      </Box>
    </Box>
  )
}

export default TransactionDetails
