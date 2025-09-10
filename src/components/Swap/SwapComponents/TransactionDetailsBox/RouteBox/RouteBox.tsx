import { Box, Grid, Skeleton, Typography } from '@mui/material'
import { useStyles } from './styles'
import { useMediaQuery } from '@mui/material'
import routeArrow1 from '@static/svg/routeArrow1.svg'
import routeArrow2 from '@static/svg/routeArrow2.svg'
import { theme } from '@static/theme'
import { BN } from '@coral-xyz/anchor'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
import { formatNumberWithoutSuffix, printBN } from '@utils/utils'
import { SimulationPath } from '@components/Swap/Swap'
import { selectTokenIcon } from '@static/icons'
import loadingAnimation from '@static/gif/loading.gif'

interface IProps {
  simulationPath: SimulationPath
  isLoadingRate: boolean
}

const MAX_DIGITS = 5

const RouteBox: React.FC<IProps> = ({
  simulationPath: {
    tokenFrom,
    tokenBetween,
    tokenTo,
    firstPair,
    secondPair,
    firstAmount,
    secondAmount
  },
  isLoadingRate
}) => {
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('sm'))

  const onePoolType = tokenBetween !== null
  const { classes, cx } = useStyles({ onePoolType })
  const firstFeePercent = Number(printBN(firstPair?.feeTier.fee ?? new BN(0), DECIMAL - 2))
  const secondFeePercent = Number(printBN(secondPair?.feeTier.fee ?? new BN(0), DECIMAL - 2))

  return (
    <Grid
      container
      justifyContent='space-around'
      alignItems='center'
      className={classes.swapFlowContainer}>
      {isSmallDevice ? (
        <>
          <Box className={cx(classes.loader, { [classes.isLoading]: isLoadingRate })}>
            <img
              src={loadingAnimation}
              style={{ height: 25, width: 25, zIndex: 10 }}
              alt='loading'></img>
          </Box>
          <Typography className={classes.tokenLabel}>
            {tokenFrom?.symbol} {'→ '}
            {onePoolType && `${tokenBetween?.symbol} (${firstFeePercent}%) → `} {tokenTo?.symbol} (
            {onePoolType ? secondFeePercent : firstFeePercent}%)
          </Typography>
        </>
      ) : (
        <>
          <Box className={cx(classes.loader, { [classes.isLoading]: isLoadingRate })}>
            <Box className={classes.tokenContainer}>
              <img src={selectTokenIcon} className={classes.tokenIcon} />
              <Skeleton className={classes.tokenLabelSkeleton} />
            </Box>
            <img
              src={loadingAnimation}
              style={{ height: 25, width: 25, zIndex: 10 }}
              alt='loading'></img>
            <Box className={classes.tokenContainer}>
              <img src={selectTokenIcon} className={classes.tokenIcon} />
              <Skeleton className={classes.tokenLabelSkeleton} />
            </Box>
          </Box>
          <>
            <Box className={classes.tokenContainer}>
              <img src={tokenFrom?.logoURI} className={classes.tokenIcon} />
              <Typography className={classes.tokenLabel}>
                {(tokenFrom?.symbol.length ?? 0) > MAX_DIGITS
                  ? tokenFrom?.symbol.slice(0, MAX_DIGITS) + '...'
                  : tokenFrom?.symbol}
              </Typography>
            </Box>
            <Box className={classes.arrowContainer}>
              <Typography className={classes.routeLabel}>{firstFeePercent}% fee</Typography>
              <img
                className={classes.routeIcon}
                src={onePoolType ? routeArrow1 : routeArrow2}
                alt='route arrow'
              />

              <Typography className={classes.routeLabel}>
                {`${formatNumberWithoutSuffix(printBN(firstAmount ?? new BN(0), tokenFrom?.decimals ?? 0))} ${
                  (tokenFrom?.symbol.length ?? 0) > MAX_DIGITS
                    ? tokenFrom?.symbol.slice(0, MAX_DIGITS) + '...'
                    : tokenFrom?.symbol
                }`}
              </Typography>
            </Box>
            {onePoolType && (
              <>
                <Box className={classes.tokenContainer}>
                  <img src={tokenBetween?.logoURI} className={classes.tokenIcon} />
                  <Typography className={classes.tokenLabel}>
                    {(tokenBetween?.symbol.length ?? 0) > MAX_DIGITS
                      ? tokenBetween?.symbol.slice(0, MAX_DIGITS) + '...'
                      : tokenBetween?.symbol}
                  </Typography>
                </Box>
                <Box className={classes.arrowContainer}>
                  <Typography className={classes.routeLabel}>{secondFeePercent}% fee</Typography>
                  <img className={classes.routeIcon} src={routeArrow1} alt='route arrow' />
                  <Typography className={classes.routeLabel}>
                    {formatNumberWithoutSuffix(
                      printBN(secondAmount ?? new BN(0), tokenBetween?.decimals ?? 0)
                    )}{' '}
                    {(tokenBetween?.symbol.length ?? 0) > MAX_DIGITS
                      ? tokenBetween?.symbol.slice(0, MAX_DIGITS) + '...'
                      : tokenBetween?.symbol}
                  </Typography>
                </Box>
              </>
            )}
            <Box className={classes.tokenContainer}>
              <img src={tokenTo?.logoURI} className={classes.tokenIcon} />
              <Typography className={classes.tokenLabel}>
                {' '}
                {(tokenTo?.symbol.length ?? 0) > MAX_DIGITS
                  ? tokenTo?.symbol.slice(0, MAX_DIGITS) + '...'
                  : tokenTo?.symbol}
              </Typography>
            </Box>
          </>
        </>
      )}
    </Grid>
  )
}

export default RouteBox
