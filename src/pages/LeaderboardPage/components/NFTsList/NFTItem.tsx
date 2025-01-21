import React from 'react'
import { useStyles } from './style'
import { Button, Grid, Typography, useMediaQuery } from '@mui/material'
import { NFT } from './PoolList'
import icons from '@static/icons'
import { theme } from '@static/theme'

export interface NFTItemInterface {
  number: number
  nft: NFT
  userPosition: number
}

const NFTItem: React.FC<NFTItemInterface> = ({ number, nft, userPosition }) => {
  const { classes } = useStyles({ isEven: number % 2 === 0 })
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

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
