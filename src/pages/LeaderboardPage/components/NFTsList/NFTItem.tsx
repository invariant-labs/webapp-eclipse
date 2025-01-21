import React from 'react'
import { useStyles } from './style'
import { Button, Grid, Typography } from '@mui/material'
import { NFT } from './PoolList'
import icons from '@static/icons'

export interface NFTItemInterface {
  number: number
  nft: NFT
  userPosition: number
}

const NFTItem: React.FC<NFTItemInterface> = ({ number, nft, userPosition }) => {
  const { classes } = useStyles({ isEven: number % 2 === 0 })

  return (
    <Grid className={classes.container} container alignItems='center'>
      <div className={classes.background} />
      <Typography className={classes.number}>{number}</Typography>
      <Grid
        display='flex'
        flex={1}
        alignItems='center'
        justifyContent='space-between'
        gap={4}
        className={classes.innerContainer}>
        <Grid display='flex' justifyContent='center' alignItems='center'>
          <img
            src='https://thenftbrief.com/wp-content/uploads/2023/05/image-27.png'
            alt=''
            style={{ width: '200px', borderRadius: 8 }}
          />
        </Grid>
        <Grid
          display='flex'
          gap={3}
          flexDirection='column'
          justifyContent='center'
          alignItems='center'>
          <Grid display='flex' justifyContent='center' alignItems='center'>
            <img src={icons.airdropGrey} alt='points' />
            <Typography className={classes.subtitle}>{nft.name}</Typography>
          </Grid>
          <Typography className={classes.title}>
            {userPosition >= nft.eligible ? 'Eligible' : 'Not eligible'}
          </Typography>
          <Button
            className={classes.button}
            onClick={() => {}}
            variant='contained'
            disabled={userPosition >= nft.eligible}>
            Claim
          </Button>
        </Grid>
        <Grid
          display='flex'
          gap={3}
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
