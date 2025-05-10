import React, { useEffect, useRef, useState } from 'react'
import { useStylesList } from './style'
import { Grid, Typography, useMediaQuery } from '@mui/material'
import { PublicKey } from '@solana/web3.js'
import { rewards } from '@store/consts/static'
import RewardItem from './RewardItem'
import { theme } from '@static/theme'
import Scrollbars from 'rc-scrollbars'
import { scrollArrowIcon } from '@static/icons'

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

  const smoothScrollTo = (target: number) => {
    const scroll = scrollRef.current
    if (!scroll) return

    const start = scroll.getScrollTop()
    const change = target - start
    const duration = 300
    let startTime: number | null = null

    const animateScroll = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime
      const percent = Math.min(progress / duration, 1)
      scroll.scrollTop(start + change * percent)

      if (progress < duration) {
        window.requestAnimationFrame(animateScroll)
      }
    }

    window.requestAnimationFrame(animateScroll)
  }

  const scrollToNext = () => {
    const scroll = scrollRef.current
    if (!scroll) return

    const containerRect = scroll.container?.getBoundingClientRect()

    const next = itemRefs.current.find(ref => {
      if (!ref) return
      const rect = ref.getBoundingClientRect()
      if (!containerRect) return
      return rect.top - containerRect.top > 10
    })

    if (next) {
      const offset = next.offsetTop
      smoothScrollTo(offset)
    }
  }

  const scrollUp = () => {
    itemRefs.current[0]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
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
          <Grid className={classes.topArrowIconWrapper} onClick={scrollUp}>
            <img className={classes.arrowTopIcon} src={scrollArrowIcon} />
            <img className={classes.arrowTopIcon2} src={scrollArrowIcon} />
          </Grid>
          <Scrollbars
            ref={scrollRef}
            onScroll={handleScroll}
            style={{ maxWidth: 1210, overflowX: 'hidden' }}
            autoHide
            universal
            classes={{
              thumbVertical: classes.scrollbarThumb,
              trackVertical: classes.scrollbarTrack,
              view: classes.scrollbarView
            }}
            autoHeight
            hideTracksWhenNotNeeded
            autoHeightMax={912}>
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
            <img className={classes.arrowIcon} src={scrollArrowIcon} />
            {displayAnimation && <img className={classes.arrowIcon2} src={scrollArrowIcon} />}
          </Grid>
        </>
      )}
    </div>
  )
}
export default NFTsList
