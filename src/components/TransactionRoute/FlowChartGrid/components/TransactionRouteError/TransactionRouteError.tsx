import { Box, Typography } from '@mui/material'
import useStyles from './style'
import React from 'react'

interface ITransactionRouteError {
  error?: string
}

const TransactionRouteError: React.FC<ITransactionRouteError> = ({ error }) => {
  const { classes } = useStyles()

  return (
    <Box className={classes.loaderContainer}>
      <Typography className={classes.pleaseWaitText}>Error!</Typography>
      <Typography className={classes.lookingForRouteText}>{error}</Typography>
    </Box>
  )
}

export default TransactionRouteError
