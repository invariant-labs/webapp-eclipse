import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Box, ClickAwayListener, Skeleton, Typography, useMediaQuery } from '@mui/material'
import useStyles from './style'
import { DropdownIcon } from '@static/componentIcon/DropdownIcon'
import { theme } from '@static/theme'

export interface IProps {
  onSelect: (value: number) => void
  feeTiers: number[]
  currentFeeIndex: number
  promotedPoolTierIndex?: number
  feeTiersWithTvl: Record<number, number>
  totalTvl: number
  disabledFeeTiers: string[]
  noData: boolean
  isLoading: boolean
}

export const FeeSelector: React.FC<IProps> = ({
  onSelect,
  feeTiers,
  currentFeeIndex,
  feeTiersWithTvl,
  totalTvl,
  promotedPoolTierIndex,
  disabledFeeTiers,
  noData,
  isLoading
}) => {
  const { classes, cx } = useStyles()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isTablet = useMediaQuery(theme.breakpoints.down(1200))

  const toggleDropdown = () => setOpen(prev => !prev)
  const closeDropdown = () => setOpen(false)

  const feeTiersTVLValues = Object.values(feeTiersWithTvl)
  const bestFee = feeTiersTVLValues.length > 0 ? Math.max(...feeTiersTVLValues) : 0
  const isPromotedPool = promotedPoolTierIndex !== undefined && promotedPoolTierIndex !== null

  const originalBestTierIndex = isPromotedPool
    ? promotedPoolTierIndex!
    : feeTiers.findIndex(tier => feeTiersWithTvl[tier] === bestFee && bestFee > 0)

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
    closeDropdown()
    onSelect(tier)
  }

  useEffect(() => {
    const doesExist = doesPoolExist(feeTiers[currentFeeIndex])

    if (!doesExist) {
      onSelect(originalBestTierIndex)
    }
  }, [currentFeeIndex, originalBestTierIndex])

  return (
    <ClickAwayListener onClickAway={closeDropdown}>
      <Box
        className={cx(classes.wrapper, { [classes.selectorDisabled]: noData })}
        ref={dropdownRef}
        onClick={noData ? () => {} : toggleDropdown}>
        {!isLoading ? (
          <>
            <Box
              className={cx(classes.selected, {
                [classes.bestSelect]: currentFeeIndex === originalBestTierIndex,
                [classes.promotedSelect]: currentFeeIndex === promotedPoolTierIndex
              })}>
              {noData ? (
                <Typography className={classes.selectedText}>No Data</Typography>
              ) : (
                <>
                  <Typography className={classes.selectedText}>
                    {feeTiers[currentFeeIndex]}%
                  </Typography>
                  {!open ? <DropdownIcon /> : <DropdownIcon style={{ transform: 'scaleY(-1)' }} />}
                </>
              )}
            </Box>

            {open && (
              <Box className={classes.dropdown}>
                {feeTiers.map((tier, index) => {
                  const notCreated = !doesPoolExist(tier)
                  const disabled = disabledFeeTiers.includes(tier.toString())

                  return (
                    <Box
                      key={tier}
                      className={cx(classes.option, {
                        [classes.disabled]: notCreated,
                        [classes.best]: index === originalBestTierIndex,
                        [classes.promoted]: index === promotedPoolTierIndex,
                        [classes.active]: currentFeeIndex === index
                      })}
                      onClick={e => {
                        e.stopPropagation()
                        e.preventDefault()
                        if (!notCreated) {
                          setOpen(false)
                          closeDropdown()
                          handleSelect(index)
                        }
                      }}>
                      <Typography className={classes.optionText}>{tier}%</Typography>
                      <Typography className={classes.tvlText}>
                        {disabled
                          ? 'Pool disabled'
                          : notCreated
                            ? 'Not created'
                            : getTvlValue(tier) + ' TVL'}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            )}
          </>
        ) : (
          <Skeleton
            variant='rounded'
            width={132}
            height={isTablet ? 40 : 44}
            sx={{ borderRadius: '8px' }}
          />
        )}
      </Box>
    </ClickAwayListener>
  )
}
