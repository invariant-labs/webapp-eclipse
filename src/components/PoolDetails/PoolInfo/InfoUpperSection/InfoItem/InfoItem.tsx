import React, { useMemo } from 'react'
import { Box, Skeleton, Typography } from '@mui/material'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { horizontalSwapIcon, infoIcon, plusIcon } from '@static/icons'
import { colors, typography } from '@static/theme'
import { NetworkType } from '@store/consts/static'
import { NewTabIcon } from '@static/componentIcon/NewTabIcon'
import { CopyIcon } from '@static/componentIcon/CopyIcon'
import { ReverseTokensIcon } from '@static/componentIcon/ReverseTokensIcon'
import { SwapToken } from '@store/selectors/solanaWallet'
import { VariantType } from 'notistack'
import useStyles from './style'
import { PoolSnap } from '@store/reducers/stats'
import { Intervals as IntervalsKeys } from '@store/consts/static'
import { WarningIcon } from '@static/componentIcon/WarningIcon'

export interface IProps {
  isLoadingStats: boolean
  name: string
  value: string | number
  isGreen?: boolean
}

export const InfoItem: React.FC<IProps> = ({ isLoadingStats, name, value, isGreen }) => {
  const { classes, cx } = useStyles()

  return (
    <Box className={cx(classes.container, { [classes.green]: isGreen })}>
      <Box display='flex' alignItems='center' gap={'2px'}>
        <Typography
          style={typography.caption1}
          color={isGreen ? colors.invariant.green : colors.invariant.textGrey}>
          {name}{' '}
        </Typography>
        {isGreen && (
          <TooltipHover title='tooltip'>
            <WarningIcon color={colors.invariant.green} height={12} />
          </TooltipHover>
        )}
      </Box>
      <Typography style={typography.caption2}>{value}</Typography>
    </Box>
  )
}

export default InfoItem
