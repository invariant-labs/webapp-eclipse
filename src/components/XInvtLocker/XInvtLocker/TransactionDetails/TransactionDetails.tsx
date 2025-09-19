import React from 'react'
import { Box } from '@mui/system'
import { Skeleton, Typography } from '@mui/material'
import useStyles from './style'
import { formatNumberWithSuffix } from '@utils/utils'

interface ITransactionDetails {
  tokenFromTicker: string
  tokenFromAmount: string
  tokenToTicker: string
  tokenToAmount: string
  loading: boolean
  currentYield: number
  yieldChange: number
  income: number
}

const TransactionDetails: React.FC<ITransactionDetails> = ({
  tokenFromTicker,
  tokenFromAmount,
  tokenToTicker,
  tokenToAmount,
  loading,
  currentYield,
  yieldChange,
  income
}) => {
  const { classes } = useStyles()

  return (
    <Box className={classes.wrapper}>
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography className={classes.label}>Exchange rate</Typography>
        {loading ? (
          <Skeleton width={125} height={24} variant='rounded' sx={{ borderRadius: '8px' }} />
        ) : (
          <Typography className={classes.value}>
            1 {tokenFromTicker} = {Number(tokenToAmount).toFixed(0)} {tokenToTicker}
          </Typography>
        )}
      </Box>
      <Box display='flex' justifyContent='space-between' alignItems='center' mt='16px'>
        <Typography className={classes.label}>Yield impact</Typography>
        {loading ? (
          <Skeleton width={125} height={24} variant='rounded' sx={{ borderRadius: '8px' }} />
        ) : (
          <Typography className={classes.value}>
            {!!tokenFromAmount
              ? currentYield.toFixed(2) + '%' + ' ⟶ ' + yieldChange.toFixed(2) + '%'
              : '-'}
          </Typography>
        )}
      </Box>
      <Box display='flex' justifyContent='space-between' alignItems='center' mt='16px'>
        <Typography className={classes.label}>Estimated income</Typography>
        {loading ? (
          <Skeleton width={125} height={24} variant='rounded' sx={{ borderRadius: '8px' }} />
        ) : (
          <Typography className={classes.greenValue}>
            {tokenFromAmount ? +tokenFromAmount + ' +' : ''} {formatNumberWithSuffix(income)} INVT
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default TransactionDetails
