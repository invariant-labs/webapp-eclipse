import React, { useMemo } from 'react'
import { useStyles } from './style'
import { Button, Grid, Typography, useMediaQuery } from '@mui/material'
import { NFT } from './PoolList'
import icons from '@static/icons'
import { theme } from '@static/theme'
import { eligibleAddresses } from '@store/consts/static'

export interface NFTItemInterface {
  number: number
  nft: NFT
  userAddress: string
}

const NFTItem: React.FC<NFTItemInterface> = ({ number, nft, userAddress }) => {
  const { classes } = useStyles({ isEven: number % 2 === 0 })
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  const isEligible = useMemo(() => {
    const reward = eligibleAddresses.find(
      a => a.rewardKey === nft.name && a.addresses.includes(userAddress)
    )

    return reward && nft.distributionDate < new Date().toISOString()
  }, [eligibleAddresses, userAddress, nft])

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
              src='https://thenftbrief.com/wp-content/uploads/2023/05/image-27.png'
              alt=''
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
          <Button
            className={isEligible ? classes.buttonGreen : classes.button}
            onClick={() => {}}
            variant='contained'
            disabled={!isEligible}>
            {isEligible ? 'Sent' : 'Claim'}
          </Button>
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
export default NFTItem
