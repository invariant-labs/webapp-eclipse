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
  const [isTop, setIsTop] = useState(true)
  const [isBottom, setIsBottom] = useState(false)
  const { classes } = useStylesList({ displayAnimation, isTop, isBottom })
  const scrollRef = useRef<Scrollbars>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const scrollToNext = () => {
    const currentIndex = itemRefs.current.findIndex(ref => {
      if (!ref) return false
      const rect = ref.getBoundingClientRect()
      return rect.top >= 0 && rect.bottom <= window.innerHeight
    })

    const nextRef = itemRefs.current[currentIndex + 1]
    if (nextRef) {
      nextRef.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleScroll = () => {
    const scrollTop = scrollRef.current?.getScrollTop() ?? 0
    const scrollHeight = scrollRef.current?.getScrollHeight() ?? 0
    const clientHeight = scrollRef.current?.getClientHeight() ?? 0

    setIsTop(scrollTop <= 5)
    setIsBottom(scrollTop + clientHeight >= scrollHeight - 5)
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
            autoHeightMax={600}>
            <Grid container className={classes.list}>
              {rewards.map((reward, index) => (
                <div
                  style={{ width: '100%' }}
                  key={index}
                  ref={el => (itemRefs.current[index] = el)}>
                  <RewardItem
                    number={index + 1}
                    reward={reward}
                    userAddress={userAddress.toString()}
                    isConnected={isConnected}
                  />
                </div>
              ))}
            </Grid>
          </Scrollbars>
          <Grid className={classes.arrowIconWrapper} onClick={scrollToNext}>
            <img className={classes.arrowIcon} src={icons.scrollArrow} />
            {displayAnimation && <img className={classes.arrowIcon2} src={icons.scrollArrow} />}
          </Grid>
        </>
      )}
    </div>
  )
}
export default NFTsList
