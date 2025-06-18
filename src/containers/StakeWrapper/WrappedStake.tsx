import React from 'react'
import useStyles from './styles'
import { Box, Grid, Typography } from '@mui/material'
import LiquidityStaking from '@components/Stake/Stake'
import { Link } from 'react-router-dom'
import LaunchIcon from '@mui/icons-material/Launch'
import { useDispatch, useSelector } from 'react-redux'
import { status, swapTokensDict } from '@store/selectors/solanaWallet'
import { StakeLiquidityPayload } from '@store/reducers/sBitz'
import { actions } from '@store/reducers/sBitz'

export const WrappedStake: React.FC = () => {
  const { classes } = useStyles()
  const dispatch = useDispatch()

  const walletStatus = useSelector(status)
  const tokens = useSelector(swapTokensDict)

  const handleStake = (props: StakeLiquidityPayload) => {
    dispatch(actions.stake(props))
  }
  return (
    <Grid container className={classes.wrapper}>
      <Box display='flex' flexDirection='column' alignItems='center' gap={'12px'}>
        <Typography className={classes.header}>Liquidity staking</Typography>
        <Box className={classes.subheaderDescription}>
          Earn more with sBITZ.
          <Link to='' target='_blank' className={classes.learnMoreLink}>
            <span> Learn more</span> <LaunchIcon classes={{ root: classes.clipboardIcon }} />
          </Link>
        </Box>
      </Box>
      <LiquidityStaking walletStatus={walletStatus} tokens={tokens} handleStake={handleStake} />
    </Grid>
  )
}

export default WrappedStake
