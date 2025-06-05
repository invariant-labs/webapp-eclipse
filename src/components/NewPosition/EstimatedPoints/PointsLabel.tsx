import { Box, Fade, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useStylesPointsLabel } from './style'
import { airdropRainbowIcon, infoCircleIcon } from '@static/icons'
import { BN } from '@coral-xyz/anchor'
import { formatNumberWithSuffix, printBN } from '@utils/utils'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'
import EstimatedPoints from './EstimatedPoints'
import { PositionOpeningMethod } from '@store/consts/types'

export interface IPointsLabel {
  handleClickFAQ: () => void
  concentrationArray: number[]
  concentrationIndex: number
  estimatedPointsPerDay: BN
  estimatedScalePoints: { min: BN; middle: BN; max: BN }
  isConnected: boolean
  showWarning: boolean
  singleDepositWarning: boolean
  positionOpeningMethod: PositionOpeningMethod
}

export const PointsLabel: React.FC<IPointsLabel> = ({
  estimatedPointsPerDay,
  isConnected,
  ...props
}) => {
  const [showModal, setShowModal] = useState(false)

  const isLessThanMinimal = (value: BN) => {
    const minimalValue = new BN(1).mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL - 2)))
    return value.lt(minimalValue)
  }
  const pointsPerDayFormat: string | number = isLessThanMinimal(estimatedPointsPerDay)
    ? isConnected && !estimatedPointsPerDay.isZero()
      ? '<0.01'
      : 0
    : formatNumberWithSuffix(printBN(estimatedPointsPerDay, LEADERBOARD_DECIMAL), {
        decimalsAfterDot: 1
      })

  const { classes } = useStylesPointsLabel()

  return (
    <>
      <div>
        <Box className={classes.wrapper} onClick={() => setShowModal(true)}>
          <img src={airdropRainbowIcon} alt='' width={12} />
          <Typography className={classes.text}>Points:</Typography>
          <Typography className={classes.pointsAmount}>
            {pointsPerDayFormat.toString() === '0' ? '0.00' : pointsPerDayFormat}
          </Typography>
          <img src={infoCircleIcon} alt='' className={classes.infoCircle} />
        </Box>

        <Fade in={showModal}>
          <div className={classes.modal}>
            <div onClick={() => setShowModal(prev => !prev)}>
              <EstimatedPoints
                estimatedPointsPerDay={estimatedPointsPerDay}
                isConnected={isConnected}
                {...props}
              />
            </div>
          </div>
        </Fade>
      </div>
      {showModal && <div className={classes.rootBackground} onClick={() => setShowModal(false)} />}
    </>
  )
}

export default PointsLabel
