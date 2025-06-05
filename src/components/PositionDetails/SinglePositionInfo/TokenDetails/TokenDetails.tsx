import { Box, Skeleton, Typography } from '@mui/material'
import { useStyles } from './style'
import { formatNumberWithSuffix, getThresholdsDecimals } from '@utils/utils'
import { TokenBadge } from '../TokenBadge/TokenBadge'
import { thresholdsWithTokenDecimal } from '@store/consts/static'

type Props = {
  icon: string
  ticker: string
  amount: number
  decimal: number
  price?: number
  isLoading: boolean
}

export const TokenDetails = ({ icon, ticker, amount, decimal, price, isLoading }: Props) => {
  const { classes } = useStyles()

  const parsedTokenAmount = Math.abs(amount) < 10 ** -decimal ? 0 : amount

  return (
    <Box className={classes.tokenContainer}>
      <Box className={classes.tokenLeftSide}>
        <TokenBadge icon={icon} ticker={ticker} />
        {isLoading ? (
          <Skeleton variant='rounded' height={17} width={32} />
        ) : (
          <Typography className={classes.tokenValue}>
            ${price ? formatNumberWithSuffix((amount * price).toFixed(2)) : 0}
          </Typography>
        )}
      </Box>
      {isLoading ? (
        <Skeleton variant='rounded' height={32} width={160} />
      ) : (
        <Typography className={classes.tokenAmount}>
          {formatNumberWithSuffix(parsedTokenAmount, {
            decimalsAfterDot: getThresholdsDecimals(
              parsedTokenAmount,
              thresholdsWithTokenDecimal(decimal)
            ),
            noSubNumbers: true,
            alternativeConfig: true
          })}
        </Typography>
      )}
    </Box>
  )
}
