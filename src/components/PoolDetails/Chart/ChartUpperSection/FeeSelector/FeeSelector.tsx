import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  Box,
  ClickAwayListener,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Typography
} from '@mui/material'
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
  feeTiers: number[]
  currentValue: number
  promotedPoolTierIndex?: number
  feeTiersWithTvl: Record<number, number>
  totalTvl: number
  isOpen?: boolean
}

export const FeeSelector: React.FC<IProps> = ({
  onSelect,
  feeTiers,
  currentValue,
  feeTiersWithTvl,
  totalTvl,
  promotedPoolTierIndex,
  isOpen
}) => {
  const { classes, cx } = useStyles()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = () => setOpen(prev => !prev)
  const closeDropdown = () => setOpen(false)

  const doesPoolExist = useCallback(
    (tier: number) => Object.prototype.hasOwnProperty.call(feeTiersWithTvl, tier),
    [feeTiersWithTvl]
  )

  const getTvlValue = useCallback(
    (tier: number) => {
      const value = feeTiersWithTvl[tier]
      if (!doesPoolExist(tier) || value === 0) return '0%'
      if (Object.keys(feeTiersWithTvl).length === 1) return '100%'
      const pct = Math.round((value / totalTvl) * 100)
      if (pct < 1) return '<1%'
      if (pct > 99) return '>99%'
      return `${pct}%`
    },
    [doesPoolExist, feeTiersWithTvl, totalTvl]
  )

  const handleSelect = (tier: number) => {
    console.log(tier)
    onSelect(tier)
    closeDropdown()
  }

  return (
    <ClickAwayListener onClickAway={closeDropdown}>
      <Box className={classes.wrapper} ref={dropdownRef}>
        <Box className={classes.selected} onClick={toggleDropdown}>
          <Typography className={classes.selectedText}>{currentValue}% Fee Tier</Typography>
          <Box className={classes.arrow} />
        </Box>

        {open && (
          <Box className={classes.dropdown}>
            {feeTiers.map(tier => {
              const disabled = !doesPoolExist(tier)
              return (
                <Box
                  key={tier}
                  className={cx(classes.option, {
                    [classes.disabled]: disabled,
                    [classes.active]: currentValue === tier
                  })}
                  onClick={() => !disabled && handleSelect(tier)}>
                  <Typography className={classes.optionText}>{tier}%</Typography>
                  <Typography className={classes.tvlText}>{getTvlValue(tier)} TVL</Typography>
                </Box>
              )
            })}
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  )
}
