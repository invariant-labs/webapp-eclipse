import React from 'react'
import { Box, Grid } from '@mui/material'
import useStyles from './style'
import { swapArrowIcon } from '@static/icons'

export interface ISwapSeparator {
  onClick: () => void
  rotateRight: boolean
  isRotating: boolean
}

export const SwapSeparator: React.FC<ISwapSeparator> = ({ onClick, rotateRight, isRotating }) => {
  const { classes, cx } = useStyles({ rotateRight })

  return (
    <Grid container className={classes.wrapper}>
      <Box className={classes.separator} />

      <Box className={classes.centered}>
        <img
          src={swapArrowIcon}
          alt='Swap Arrow'
          className={cx(classes.swapArrow, isRotating && classes.rotate)}
          onClick={isRotating ? () => {} : onClick}
          width={10}
          height={16}
        />
      </Box>
    </Grid>
  )
}

export default SwapSeparator
