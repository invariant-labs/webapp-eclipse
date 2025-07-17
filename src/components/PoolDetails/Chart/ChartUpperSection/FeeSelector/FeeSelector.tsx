import React, { useMemo } from 'react'
import { Box, FormControl, InputLabel, MenuItem, Select, Skeleton, Typography } from '@mui/material'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { horizontalSwapIcon, plusIcon } from '@static/icons'
import { colors, typography } from '@static/theme'
import { NetworkType } from '@store/consts/static'
import { NewTabIcon } from '@static/componentIcon/NewTabIcon'
import { CopyIcon } from '@static/componentIcon/CopyIcon'
import { ReverseTokensIcon } from '@static/componentIcon/ReverseTokensIcon'
import { SwapToken } from '@store/selectors/solanaWallet'

import { VariantType } from 'notistack'
import useStyles from './style'

export interface IProps {
  onSelect: (value: number) => void
  //   showOnlyPercents?: boolean
  feeTiers: number[]
  currentValue: string
  promotedPoolTier: number
  feeTiersWithTvl: Record<number, number>
  //   disabledFeeTiers: string[]
  totalTvl: number
}

export const FeeSelector: React.FC<IProps> = ({ onSelect, feeTiers, currentValue }) => {
  const { classes } = useStyles()

  return (
    <FormControl fullWidth>
      <InputLabel id='select-label'>Age</InputLabel>
      <Select
        labelId='select-label'
        value={10}
        label='Age'
        onChange={e => {
          onSelect(e.target.value as number)
        }}>
        <MenuItem value={10}>Ten</MenuItem>
        <MenuItem value={20}>Twenty</MenuItem>
        <MenuItem value={30}>Thirty</MenuItem>
      </Select>
    </FormControl>
  )
}

export default FeeSelector
