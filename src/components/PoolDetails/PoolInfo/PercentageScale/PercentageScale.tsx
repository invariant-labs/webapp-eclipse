import React, { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { SwapToken } from '@store/selectors/solanaWallet'
import useStyles from './style'
import { colors, typography } from '@static/theme'
import { useAverageLogoColor } from '@store/hooks/userOverview/useAverageLogoColor'

export interface IProps {
  tokenX: SwapToken
  tokenY: SwapToken
  tokenXPercentage: number
  tokenYPercentage: number
}

export const PercentageScale: React.FC<IProps> = ({
  tokenX,
  tokenY,
  tokenXPercentage,
  tokenYPercentage
}) => {
  const { getAverageColor, getTokenColor, tokenColorOverrides } = useAverageLogoColor()

  const [colorX, setColorX] = useState<string>(() =>
    getTokenColor(tokenX.symbol, undefined, tokenColorOverrides)
  )
  const [colorY, setColorY] = useState<string>(() =>
    getTokenColor(tokenY.symbol, undefined, tokenColorOverrides)
  )

  useEffect(() => {
    let active = true
    getAverageColor(tokenX.logoURI, tokenX.symbol).then(col => {
      if (active) setColorX(col)
    })
    getAverageColor(tokenY.logoURI, tokenY.symbol).then(col => {
      if (active) setColorY(col)
    })
    return () => {
      active = false
    }
  }, [tokenX.logoURI, tokenX.symbol, tokenY.logoURI, tokenY.symbol, getAverageColor])

  const { classes, cx } = useStyles({
    leftPercentage: +tokenXPercentage.toFixed(2),
    colorLeft: colorX,
    colorRight: colorY
  })

  return (
    <Box
      display='flex'
      alignItems='center'
      width='100%'
      justifyContent='space-between'
      gap={'24px'}>
      <Box display='flex' alignItems='center' flexDirection='column' justifyContent='center'>
        <img className={classes.icon} src={tokenX.logoURI} alt={tokenX.symbol} />
        <Typography color={colors.invariant.text} style={typography.body2} mt={'6px'}>
          {tokenX.symbol}
        </Typography>
        <Typography
          color={colors.invariant.textGrey}
          style={typography.caption2}
          textAlign={'center'}
          noWrap>
          {tokenXPercentage.toFixed(2)} %
        </Typography>
      </Box>
      <Box className={classes.scaleContainer}>
        <div className={cx(classes.dot, classes.leftDot)} />
        <div className={classes.leftScale} />
        <div className={cx(classes.dot, classes.rightDot)} />
      </Box>
      <Box display='flex' alignItems='center' flexDirection='column' justifyContent='center'>
        <img className={classes.icon} src={tokenY.logoURI} alt={tokenY.symbol} />
        <Typography color={colors.invariant.text} style={typography.body2} mt={'6px'}>
          {tokenY.symbol}
        </Typography>
        <Typography
          color={colors.invariant.textGrey}
          style={typography.caption2}
          textAlign={'center'}
          noWrap>
          {tokenYPercentage.toFixed(2)} %
        </Typography>
      </Box>
    </Box>
  )
}

export default PercentageScale
