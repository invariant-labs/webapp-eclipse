import { BN } from '@coral-xyz/anchor'
import { Box } from '@mui/material'
import icons from '@static/icons'
import { formatNumber, removeAdditionalDecimals } from '@utils/utils'
import React, { useEffect, useRef, useState } from 'react'
import useStyles from './style'
import { LEADERBOARD_DECIMAL } from '@pages/LeaderboardPage/config'

interface IEstimatedPointsLabel {
  pointsBoxRef: React.RefObject<HTMLDivElement>
  handlePointerLeave: () => void
  handlePointerEnter: () => void
  swapMultiplier: string
  stringPointsValue: string
  pointsForSwap: BN
  isLessThanOne: boolean
  decimalIndex: any
  isAnimating: boolean
  isAnyBlurShowed: boolean
}

export const EstimatedPointsLabel: React.FC<IEstimatedPointsLabel> = ({
  handlePointerEnter,
  handlePointerLeave,
  pointsBoxRef,
  swapMultiplier,
  pointsForSwap,
  isLessThanOne,
  decimalIndex,
  isAnyBlurShowed,
  isAnimating,
  stringPointsValue
}) => {
  const [displayedValue, setDisplayedValue] = useState<string>('')
  const contentRef = useRef<HTMLDivElement>(null)
  const [isChanging, setIsChanging] = useState(false)

  const alternativeRef = useRef<HTMLDivElement>(null)
  const { classes } = useStyles({ isVisible: isAnimating, width: 200, isChanging })

  useEffect(() => {
    if (isAnimating || !pointsForSwap.isZero()) {
      setIsChanging(true)

      setDisplayedValue(
        removeAdditionalDecimals(stringPointsValue, isLessThanOne ? decimalIndex : 2)
      )

      const resetTimeout = setTimeout(() => {
        setIsChanging(isAnyBlurShowed)
      }, 10)

      return () => clearTimeout(resetTimeout)
    }
  }, [stringPointsValue, isAnimating, isAnyBlurShowed, pointsForSwap])

  return (
    <Box
      className={classes.pointsBox}
      ref={pointsBoxRef}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}>
      <div className={classes.contentWrapper} ref={contentRef}>
        <img src={icons.airdropRainbow} alt='' />
        Points:{' '}
        <span
          className={classes.pointsAmount}
          style={{ borderRight: '1px solid #3A466B', paddingRight: '10px' }}>
          <p className={classes.pointsValue}>
            {' '}
            {pointsForSwap.isZero()
              ? '0.00'
              : pointsForSwap.gte(
                    new BN('100000000000').mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL)))
                  )
                ? '>1T'
                : formatNumber(displayedValue)}
          </p>

          <img src={icons.infoCircle} alt='' width='15px' style={{ marginLeft: '5px' }} />
        </span>{' '}
        <span
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
            marginLeft: '8px'
          }}>
          {new BN(swapMultiplier, 'hex').gte(new BN(1)) &&
            `${new BN(swapMultiplier, 'hex').toNumber()}x`}
          <img src={icons.boostPoints} alt='' style={{ height: '14px', width: '12px' }} />
        </span>
      </div>

      <div className={classes.alternativeContent} ref={alternativeRef}>
        <img
          src={icons.airdropRainbow}
          alt=''
          className={classes.grayscaleIcon}
          style={{ marginLeft: '2px', marginRight: '4px' }}
        />
        How to earn points?
        <img
          src={icons.infoCircle}
          alt=''
          width='14px'
          style={{ marginTop: '-2px', marginLeft: '4px' }}
          className={classes.grayscaleIcon}
        />
      </div>
    </Box>
  )
}

export default EstimatedPointsLabel
