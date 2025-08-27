import React, { useMemo } from 'react'
import { useStyles } from './style'
import { Grid, Typography, useMediaQuery } from '@mui/material'
import { airdropGreyIcon, airdropRainbowIcon } from '@static/icons'
import { theme } from '@static/theme'
import { Reward } from '@store/consts/types'
import rewardsImages from '@static/png/rewards/rewardsImages'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
export interface RewardItemInterface {
  number: number
  reward: Reward
  userAddress: string
  isConnected?: boolean
}

const RewardItem: React.FC<RewardItemInterface> = ({
  number,
  reward,
  userAddress,
  isConnected
}) => {
  const { classes, cx } = useStyles({ isEven: number % 2 === 0 })
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  const isEligible = useMemo(() => {
    return reward.addresses.includes(userAddress)
  }, [userAddress, reward])

  const rewardReceived = useMemo(() => {
    return isEligible && reward.distributionDate < new Date().toISOString()
  }, [isEligible, reward])

  const textInfo = useMemo(() => {
    if (!isConnected) {
      return { text: 'Claim', tooltip: 'Connect wallet to see the status' }
    }
    if (rewardReceived) {
      return {
        text: 'Received',
        tooltip: 'The prize has already been distributed.'
      }
    } else if (isEligible) {
      if (reward.distributionDate === 'TBA') {
        return { text: 'Claim', tooltip: `Distribution date will be announced` }
      } else {
        return { text: 'Claim', tooltip: `Prize will be distributed at ${reward.distributionDate}` }
      }
    }

    return { text: 'Claim', tooltip: 'Prize not available.' }
  }, [isConnected, rewardReceived])

  return (
    <Grid className={classes.container} container>
      {isMd ? (
        <>
          <div className={classes.mobileBackgroundTop} />
          <div className={classes.mobileBackgroundBottom} />
        </>
      ) : (
        <div className={classes.background} />
      )}
      <Grid flex={1} className={classes.innerContainer}>
        <Grid className={classes.leftItems}>
          <Typography className={classes.number}>{number}</Typography>
          <Grid className={classes.rewardWrapper}>
            <img
              src={rewardsImages[reward.image]}
              alt={reward.name}
              style={{ width: isMd ? '100px' : '200px', borderRadius: 8 }}
            />
          </Grid>
          {isMd && <div style={{ width: '36px' }} />}
        </Grid>

        <Grid className={classes.centerWrapper}>
          <Grid className={classes.pointsWrapper}>
            <img src={isEligible ? airdropRainbowIcon : airdropGreyIcon} alt='points' width={17} />
            <Typography className={classes.subtitle}>{reward.name}</Typography>
          </Grid>
          <Typography className={classes.title}>
            {isEligible ? 'Eligible' : 'Not eligible'}
          </Typography>
          <TooltipHover
            title={textInfo.tooltip}
            placement='bottom'
            increasePadding
            allowEnterTooltip={false}
            gradient>
            <Typography className={cx(classes.infoText, rewardReceived && classes.textGreen)}>
              {textInfo.text}
            </Typography>
          </TooltipHover>
        </Grid>
        <Grid container={isMd} className={classes.infoWrapper}>
          <Grid className={classes.label}>
            <Typography>Distribution date:</Typography>
            <span>{reward.distributionDate}</span>
          </Grid>
          <Grid className={classes.label}>
            <Typography>Type:</Typography>
            <span>{reward.type}</span>
          </Grid>
          <Grid className={classes.label}>
            <Typography>Eligible:</Typography>
            <span>{reward.eligible}</span>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
export default RewardItem
