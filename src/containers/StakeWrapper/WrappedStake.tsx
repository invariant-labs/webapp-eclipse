import React from 'react'
import useStyles from './styles'
import { Box, Grid, Typography } from '@mui/material'
import LiquidityStaking from '@components/Stake/Stake'
import { Link } from 'react-router-dom'
import LaunchIcon from '@mui/icons-material/Launch'
import { useSelector } from 'react-redux'
import { status, swapTokensDict } from '@store/selectors/solanaWallet'
import { LiquidityStakingOverview } from '@components/LiquidityStakingOverview/LiquidityStakingOverview'

export const WrappedStake: React.FC = () => {
  const { classes } = useStyles()

  const walletStatus = useSelector(status)
  const tokens = useSelector(swapTokensDict)

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
      <LiquidityStakingOverview
        sBitzAmount={155732}
        sBitzValue={334721300}
        compoundTime={10}
        holders={23573}
        yieldValue={'300.5'}
      />
      <LiquidityStaking walletStatus={walletStatus} tokens={tokens} />
    </Grid>
  )
}

export default WrappedStake
