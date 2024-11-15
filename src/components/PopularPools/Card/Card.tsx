import { Box, Button, Grid, Skeleton, Typography } from '@mui/material'
import { useStyles } from './style'
import { PopularPoolData } from '@containers/PopularPoolsWrapper/PopularPoolsWrapper'
import GradientBorder from '@components/GradientBorder/GradientBorder'
import { colors } from '@static/theme'
import cardBackgroundBottom from '@static/png/cardBackground1.png'
import cardBackgroundTop from '@static/png/cardBackground2.png'
import icons from '@static/icons'
import SwapList from '@static/svg/swap-list.svg'
import { shortenAddress } from '@utils/uiUtils'
import StatsLabel from './StatsLabel/StatsLabel'
import backIcon from '@static/svg/back-arrow-2.svg'
import { addressToTicker, formatNumber, parseFeeToPathFee } from '@utils/utils'
import { useNavigate } from 'react-router-dom'
import { NetworkType } from '@store/consts/static'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
export interface ICard extends PopularPoolData {
  isLoading: boolean
  network: NetworkType
}

const Card: React.FC<ICard> = ({
  addressFrom,
  addressTo,
  TVL,
  apy,
  apyData,
  isLoading,
  isUnknownFrom,
  fee,
  iconFrom,
  iconTo,
  isUnknownTo,
  symbolFrom,
  symbolTo,
  volume,
  network
}) => {
  const { classes } = useStyles()
  const navigate = useNavigate()

  const handleOpenPosition = () => {
    navigate(
      `/newPosition/${addressToTicker(network, addressFrom ?? '')}/${addressToTicker(network, addressTo ?? '')}/${parseFeeToPathFee(Math.round(fee * 10 ** (DECIMAL - 2)))}`,
      { state: { referer: 'liquidity' } }
    )
  }

  const handleOpenSwap = () => {
    navigate(
      `/exchange/${addressToTicker(network, addressFrom ?? '')}/${addressToTicker(network, addressTo ?? '')}`,
      { state: { referer: 'liquidity' } }
    )
  }

  return (
    <Grid className={classes.root}>
      {isLoading ? (
        <Skeleton
          variant='rounded'
          animation='wave'
          width={220}
          height={304} //329 with 4 stats labels
          style={{ opacity: 0.7, borderRadius: 24 }}
        />
      ) : (
        <Grid>
          <GradientBorder
            borderRadius={24}
            borderWidth={2}
            backgroundColor={colors.invariant.component}
            innerClassName={classes.container}>
            <img
              src={cardBackgroundTop}
              alt=''
              className={classes.backgroundImage}
              style={{ top: 0, zIndex: -1 }}
            />
            <img
              src={cardBackgroundBottom}
              alt=''
              className={classes.backgroundImage}
              style={{ bottom: 0, zIndex: -1 }}
            />
            <Grid container p={'20px'} alignItems='center' flexDirection='column'>
              <Grid container className={classes.iconsWrapper}>
                <Box className={classes.iconContainer}>
                  <img
                    className={classes.tokenIcon}
                    src={iconFrom}
                    alt='Token from'
                    onError={e => {
                      e.currentTarget.src = icons.unknownToken
                    }}
                  />
                  {isUnknownFrom && <img className={classes.warningIcon} src={icons.warningIcon} />}
                </Box>
                <img className={classes.swapIcon} src={SwapList} alt='Token from' />
                <Box className={classes.iconContainer}>
                  <img
                    className={classes.tokenIcon}
                    src={iconTo}
                    alt='Token to'
                    onError={e => {
                      e.currentTarget.src = icons.unknownToken
                    }}
                  />
                  {isUnknownTo && <img className={classes.warningIcon} src={icons.warningIcon} />}
                </Box>
              </Grid>

              <Typography className={classes.symbolsContainer}>
                {shortenAddress(symbolFrom ?? '')} - {shortenAddress(symbolTo ?? '')}
              </Typography>
              <Grid container gap='8px'>
                {/* <StatsLabel title='APY' value={apy.toString()} /> */}
                <StatsLabel title='Fee' value={fee + '%'} />
                <StatsLabel title='TVL' value={`$${formatNumber(TVL)}`} />
                <StatsLabel title='Volume' value={`$${formatNumber(volume)}`} />
              </Grid>
              <Grid container justifyContent='space-between' alignItems='center' mt='auto'>
                <Grid
                  className={classes.back}
                  container
                  item
                  alignItems='center'
                  onClick={handleOpenSwap}>
                  <img className={classes.backIcon} src={backIcon} alt='Back' />
                  <Typography className={classes.backText}>Swap</Typography>
                </Grid>
                <Button className={classes.button} variant='contained' onClick={handleOpenPosition}>
                  Deposit
                </Button>
              </Grid>
            </Grid>
          </GradientBorder>
        </Grid>
      )}
    </Grid>
  )
}

export default Card
