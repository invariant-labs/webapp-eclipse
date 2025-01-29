import { Box, Grid, Typography } from '@mui/material'
import { useStyles } from './styles'
import { useMediaQuery } from '@mui/material'
import routeArrow1 from '@static/svg/routeArrow1.svg'
import routeArrow2 from '@static/svg/routeArrow2.svg'
import tokenImg from '@static/svg/selectToken.svg'
import { theme } from '@static/theme'
import { SwapToken } from '@store/selectors/solanaWallet'
import { BN } from '@coral-xyz/anchor'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
import { printBN } from '@utils/utils'

interface IProps {
  tokenFrom: SwapToken | null
  tokenTo: SwapToken | null
  tokenBetween: SwapToken | null
  baseFee: BN
  firstFee: BN | null
  secondFee: BN | null
  onePoolType: boolean
  amountIn: any
  amountOut: any
}

const RouteBox: React.FC<IProps> = ({ tokenFrom, tokenTo, baseFee, onePoolType }) => {
  const mockedData = {
    mockedFee: 0.01,
    mockedTicker: 'ETH',
    mockedAmont: 3203
  }

  const isSmallDevice = useMediaQuery(theme.breakpoints.down('sm'))

  const { classes } = useStyles({ onePoolType })
  const feePercent = Number(printBN(baseFee, DECIMAL - 2))

  return (
    <Grid
      container
      justifyContent='space-around'
      alignItems='center'
      className={classes.swapFlowContainer}>
      {isSmallDevice ? (
        <Typography className={classes.tokenLabel}>
          {tokenFrom?.symbol} {'-> '}
          {onePoolType && `${mockedData.mockedTicker} -> `}
          {tokenTo?.symbol}
        </Typography>
      ) : (
        <>
          {' '}
          <Box className={classes.tokenContainer}>
            <img src={tokenFrom?.logoURI} className={classes.tokenIcon} />
            <Typography className={classes.tokenLabel}>{tokenFrom?.symbol}</Typography>
          </Box>
          <Box className={classes.arrowContainer}>
            <Typography className={classes.routeLabel}>
              {onePoolType ? mockedData.mockedFee : feePercent}% fee
            </Typography>
            <img
              className={classes.routeIcon}
              src={onePoolType ? routeArrow1 : routeArrow2}
              alt='route arrow'
            />

            <Typography className={classes.routeLabel}>
              {onePoolType ? `${mockedData.mockedAmont} ${mockedData.mockedTicker}` : '100%'}
            </Typography>
          </Box>
          {onePoolType && (
            <>
              <Box className={classes.tokenContainer}>
                <img src={tokenImg} className={classes.tokenIcon} />
                <Typography className={classes.tokenLabel}>{mockedData.mockedTicker}</Typography>
              </Box>
              <Box className={classes.arrowContainer}>
                <Typography className={classes.routeLabel}>{mockedData.mockedFee}% fee</Typography>
                <img className={classes.routeIcon} src={routeArrow1} alt='route arrow' />
                <Typography className={classes.routeLabel}>
                  {mockedData.mockedAmont} {mockedData.mockedTicker}
                </Typography>
              </Box>
            </>
          )}
          <Box className={classes.tokenContainer}>
            <img src={tokenTo?.logoURI} className={classes.tokenIcon} />
            <Typography className={classes.tokenLabel}>{tokenTo?.symbol}</Typography>
          </Box>
        </>
      )}
    </Grid>
  )
}

export default RouteBox
