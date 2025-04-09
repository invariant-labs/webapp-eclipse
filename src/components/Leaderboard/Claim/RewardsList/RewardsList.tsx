import React, { useEffect, useRef, useState } from 'react'
import { useStylesList } from './style'
import { Grid, Typography, useMediaQuery } from '@mui/material'
import { PublicKey } from '@solana/web3.js'
import { rewards } from '@store/consts/static'
import RewardItem from './RewardItem'
import { theme } from '@static/theme'
import Scrollbars from 'rc-scrollbars'
import icons from '@static/icons'

export interface NFTsListInterface {
  userAddress: PublicKey
  isConnected?: boolean
}

const NFTsList: React.FC<NFTsListInterface> = ({ userAddress, isConnected }) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  const [displayAnimation, setDisplayAnimation] = useState(false)
  const [displayArrow, setDisplayArrow] = useState(true)
  const { classes } = useStylesList({ displayAnimation, displayArrow })
  const scrollRef = useRef<Scrollbars>(null)

  const handleScroll = () => {
    const scrollTop = scrollRef.current?.getScrollTop() ?? 0
    setDisplayArrow(scrollTop <= 5)
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const fullHeight = document.documentElement.scrollHeight

      const isBottom = scrollTop + windowHeight >= fullHeight - 10

      setDisplayAnimation(isBottom)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={classes.container}>
      <Typography className={classes.historyLabel}>History of Prizes</Typography>
      {isMobile ? (
        <Grid container className={classes.rewardWrapper}>
          {rewards.map((reward, index) => (
            <RewardItem
              key={index}
              number={index + 1}
              reward={reward}
              userAddress={userAddress.toString()}
              isConnected={isConnected}
            />
          ))}
        </Grid>
      ) : (
        <>
          <Scrollbars
            ref={scrollRef}
            onScroll={handleScroll}
            style={{ maxWidth: 1072, overflowX: 'hidden' }}
            autoHide
            universal
            classes={{
              thumbVertical: classes.scrollbarThumb,
              trackVertical: classes.scrollbarTrack,
              view: classes.scrollbarView
            }}
            autoHeight
            hideTracksWhenNotNeeded
            autoHeightMax={624}>
            <Grid container className={classes.list}>
              {rewards.map((reward, index) => (
                <RewardItem
                  key={index}
                  number={index + 1}
                  reward={reward}
                  userAddress={userAddress.toString()}
                  isConnected={isConnected}
                />
              ))}
            </Grid>
          </Scrollbars>
          <Grid className={classes.arrowIconWrapper}>
            <Grid className={classes.dropShadow} />
            <img className={classes.arrowIcon} src={icons.scrollArrow} />
            {displayAnimation && <img className={classes.arrowIcon2} src={icons.scrollArrow} />}
          </Grid>
        </>
      )}
    </div>
  )
}
export default NFTsList
