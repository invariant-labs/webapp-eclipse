import { BN } from '@coral-xyz/anchor'
import { Box } from '@mui/material'
import icons from '@static/icons'
import { formatNumber, removeAdditionalDecimals } from '@utils/utils'
import React from 'react'
import useStyles from './style'
interface IEstimatedPointsLabel {
  pointsBoxRef: React.RefObject<HTMLDivElement>
  handlePointerLeave: () => void
  handlePointerEnter: () => void
  swapMultiplier: string
  stringPointsValue: string
  isLessThanOne: boolean
  decimalIndex: any
  isAnimating: boolean
}
export const EstimatedPointsLabel: React.FC<IEstimatedPointsLabel> = ({
  handlePointerEnter,
  handlePointerLeave,
  pointsBoxRef,
  swapMultiplier,
  isLessThanOne,
  decimalIndex,
  isAnimating,
  stringPointsValue
}) => {
  const { classes } = useStyles({ isVisible: isAnimating })

  return (
    <Box
      className={classes.pointsBox}
      ref={pointsBoxRef}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}>
      <div className={classes.contentWrapper}>
        <img src={icons.airdropRainbow} alt='' />
        Points{' '}
        {new BN(swapMultiplier, 'hex').gte(new BN(1)) &&
          `${new BN(swapMultiplier, 'hex').toNumber()}x`}
        :{' '}
        <span className={classes.pointsAmount}>
          {formatNumber(
            removeAdditionalDecimals(stringPointsValue, isLessThanOne ? decimalIndex : 2)
          )}
        </span>{' '}
        <img src={icons.infoCircle} alt='' width='14px' style={{ marginTop: '-2px' }} />
      </div>

      <div className={classes.alternativeContent}>
        <img src={icons.airdropRainbow} alt='' className={classes.grayscaleIcon} />
        How to earn points?
        <img
          src={icons.infoCircle}
          alt=''
          width='14px'
          style={{ marginTop: '-2px' }}
          className={classes.grayscaleIcon}
        />
      </div>
    </Box>
  )
}

export default EstimatedPointsLabel
