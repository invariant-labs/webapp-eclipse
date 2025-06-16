import React from 'react'
import useStyles from './styles'
import { Box, Grid, Typography } from '@mui/material'
import LiquidityStaking from '@components/Stake/Stake'
import { Link } from 'react-router-dom'
import LaunchIcon from '@mui/icons-material/Launch'
import { useSelector } from 'react-redux'
import { status, swapTokensDict } from '@store/selectors/solanaWallet'
import { StakeChart } from '@components/Stake/StakeChart/StakeChart'
export const WrappedStake: React.FC = () => {
  const { classes } = useStyles()

  const generateMockChartData = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1)

    const bitzStartValue = 100
    const sBitzStartValue = 100

    const bitzGrowthRate = 0.02  // 2% daily growth
    const sBitzGrowthRate = 0.04 // 4% daily growth

    const bitzData = days.map(day => ({
      x: `Day ${day}`,
      y: Number((bitzStartValue * Math.pow(1 + bitzGrowthRate, day - 1)).toFixed(2))
    }))

    const sBitzData = days.map(day => ({
      x: `Day ${day}`,
      y: Number((sBitzStartValue * Math.pow(1 + sBitzGrowthRate, day - 1)).toFixed(2))
    }))

    return {
      bitzData,
      sBitzData,
      stakedAmount: 100,
      earnedAmount: Number((sBitzData[sBitzData.length - 1].y - bitzData[bitzData.length - 1].y).toFixed(2)),
      earnedAmountUsd: Number(((sBitzData[sBitzData.length - 1].y - bitzData[bitzData.length - 1].y) * 25).toFixed(2)) // Assuming $25 per SOL
    }
  }

  const mockData = generateMockChartData()

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
      <LiquidityStaking walletStatus={walletStatus} tokens={tokens} />
      <StakeChart
        stakedAmount={mockData.stakedAmount}
        earnedAmount={mockData.earnedAmount}
        earnedAmountUsd={mockData.earnedAmountUsd}
        bitzData={mockData.bitzData}
        sBitzData={mockData.sBitzData}
      />
    </Grid>
  )
}

export default WrappedStake