import React, { useMemo } from 'react'
import { useStyles } from './style'
import { Grid, Typography, useMediaQuery } from '@mui/material'
import icons from '@static/icons'
import { theme } from '@static/theme'
import { eligibleAddresses } from '@store/consts/static'
import { Reward } from '@store/consts/types'
import rewardsImages from '@static/png/nft/nftImages'
import classNames from 'classnames'
import { TooltipGradient } from '@components/TooltipHover/TooltipGradient'
export interface RewardItemInterface {
  number: number
  nft: Reward
  userAddress: string
  isConnected?: boolean
}

const RewardItem: React.FC<RewardItemInterface> = ({ number, nft, userAddress, isConnected }) => {
  const { classes } = useStyles({ isEven: number % 2 === 0 })
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  const isEligible = useMemo(() => {
    return eligibleAddresses.find(a => a.rewardKey === nft.key && a.addresses.includes(userAddress))
  }, [eligibleAddresses, userAddress, nft])

  const rewardReceived = useMemo(() => {
    return isEligible && nft.distributionDate < new Date().toISOString()
  }, [isEligible, nft])

  const textInfo = useMemo(() => {
    if (!isConnected) {
      return { text: 'Claim', tooltip: 'Connect wallet to see the status' }
    }
    if (rewardReceived) {
      return {
        text: 'Received',
        tooltip: 'The reward has already been distributed.'
      }
    } else if (isEligible) {
      return { text: 'Claim', tooltip: `Prize will be distributed at ${nft.distributionDate}` }
    }

    return { text: 'Claim', tooltip: 'Prize not available.' }
  }, [isConnected, rewardReceived])

  return (
    <Grid className={classes.container} container alignItems='center'>
      {isMd ? (
        <>
          <div className={classes.mobileBackgroundTop} />
          <div className={classes.mobileBackgroundBottom} />
        </>
      ) : (
        <div className={classes.background} />
      )}
      <Grid
        display='flex'
        flex={1}
        alignItems='center'
        justifyContent='space-between'
        className={classes.innerContainer}>
        <Grid className={classes.leftItems}>
          <Typography className={classes.number}>{number}</Typography>
          <Grid display='flex' justifyContent='center' alignItems='center'>
            <img
              src={rewardsImages[nft.key]}
              alt={nft.name}
              style={{ width: isMd ? '100px' : '200px', borderRadius: 8 }}
            />
          </Grid>
          {isMd && <div style={{ width: '36px' }} />}
        </Grid>

        <Grid
          display='flex'
          gap={3}
          flexDirection='column'
          justifyContent='center'
          alignItems='center'
          m={6}>
          <Grid display='flex' justifyContent='center' alignItems='center'>
            <img src={icons.airdropGrey} alt='points' />
            <Typography className={classes.subtitle}>{nft.name}</Typography>
          </Grid>
          <Typography className={classes.title}>
            {isEligible ? 'Eligible' : 'Not eligible'}
          </Typography>
          <TooltipGradient title={textInfo.tooltip} placement='bottom' top={3}>
            <Typography
              className={classNames(classes.infoText, rewardReceived && classes.textGreen)}>
              {textInfo.text}
            </Typography>
          </TooltipGradient>
        </Grid>
        <Grid
          container={isMd}
          display='flex'
          gap={isMd ? 2 : 3}
          flexDirection='column'
          justifyContent='center'
          alignItems='center'>
          <Grid
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            className={classes.label}>
            <Typography>Distribution date:</Typography>
            <span>{nft.distributionDate}</span>
          </Grid>
          <Grid
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            className={classes.label}>
            <Typography>Type:</Typography>
            <span>NFT</span>
          </Grid>
          <Grid
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            className={classes.label}>
            <Typography>Eligible:</Typography>
            <span>Top {nft.eligible}</span>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
export default RewardItem
