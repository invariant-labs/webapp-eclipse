import { BN } from '@coral-xyz/anchor'
import { Box } from '@mui/material'
import { airdropRainbowIcon, boostPointsIcon, infoCircleIcon } from '@static/icons'
import { formatNumberWithSuffix, removeAdditionalDecimals } from '@utils/utils'
import React, { useEffect, useRef, useState } from 'react'
import useStyles from './style'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'

interface IEstimatedPointsLabel {
  swapMultiplier: string
  stringPointsValue: string
  pointsForSwap: BN
  isLessThanOne: boolean
  decimalIndex: any
  isAnimating: boolean
  isAnyBlurShowed: boolean
}

export const EstimatedPointsLabel: React.FC<IEstimatedPointsLabel> = ({
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
    <Box className={classes.pointsBox}>
      <div className={classes.contentWrapper} ref={contentRef}>
        <img src={airdropRainbowIcon} alt='' />
        Points:{' '}
        <span className={classes.pointsAmount}>
          <p className={classes.pointsValue}>
            {' '}
            {pointsForSwap.isZero()
              ? '0.00'
              : pointsForSwap.gte(
                    new BN('1000000000').mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL)))
                  )
                ? '>1B'
                : formatNumberWithSuffix(displayedValue)}
          </p>

          <img src={infoCircleIcon} alt='' className={classes.infoCircle} />
        </span>
        <span className={classes.boostWrapper}>
          {new BN(swapMultiplier, 'hex').gte(new BN(1)) &&
            `${new BN(swapMultiplier, 'hex').toNumber()}x`}
          <img src={boostPointsIcon} alt='' className={classes.boostPoints} />
        </span>
      </div>

      <div className={classes.alternativeContent} ref={alternativeRef}>
        <img
          src={airdropRainbowIcon}
          alt=''
          className={classes.grayscaleIcon}
          style={{ marginLeft: '2px', marginRight: '4px' }}
        />
        How to earn points?
        <img
          src={infoCircleIcon}
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
