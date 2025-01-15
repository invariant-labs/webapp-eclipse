import { Box, Typography } from '@mui/material'
import loadingAnimation from '@static/gif/loading.gif'
import { formatNumber } from '@utils/utils'
import React from 'react'
import useStyles from './style'
import classNames from 'classnames'

interface iProps {
  tokenFromSymbol: string
  tokenToSymbol: string
  amount: number
  tokenToDecimals: number
  loading: boolean
  onClick: () => void
  isPairGivingPoints: boolean
}

const ExchangeRate: React.FC<iProps> = ({
  tokenFromSymbol,
  tokenToSymbol,
  amount,
  tokenToDecimals,
  loading,
  onClick,
  isPairGivingPoints
}) => {
  const { classes } = useStyles()
  const setLoading = () => {
    return loading ? (
      <Box className={classes.loadingContainer}>
        <img src={loadingAnimation} className={classes.loading} alt='Loading'></img>
      </Box>
    ) : (
      <Typography className={classNames(isPairGivingPoints && classes.whiteText)}>
        1 {tokenFromSymbol} ={' '}
        {isNaN(amount)
          ? 0
          : formatNumber(amount.toFixed(tokenToDecimals)) === '0'
            ? '~0'
            : formatNumber(amount.toFixed(tokenToDecimals))}{' '}
        {tokenToSymbol}
      </Typography>
    )
  }

  return (
    <Box className={classes.ableToHover} onClick={onClick}>
      {setLoading()}
    </Box>
  )
}

export default ExchangeRate
