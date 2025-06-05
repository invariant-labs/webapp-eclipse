import React, { useState, useRef, useLayoutEffect, useCallback } from 'react'
import { Grid, Skeleton, Tab, Tabs, Typography } from '@mui/material'
import { Box } from '@mui/material'
import useStyles, { useSingleTabStyles, useTabsStyles } from './style'
import { formatNumberWithSuffix } from '@utils/utils'

export interface IFeeSwitch {
  onSelect: (value: number) => void
  showOnlyPercents?: boolean
  feeTiers: number[]
  currentValue: number
  promotedPoolTierIndex: number | undefined
  feeTiersWithTvl: Record<number, number>
  showTVL?: boolean

  totalTvl: number
  isLoadingStats: boolean
  containerKey?: string
}

export const FeeSwitch: React.FC<IFeeSwitch> = ({
  onSelect,
  showOnlyPercents = false,
  feeTiers,
  promotedPoolTierIndex,
  showTVL,
  currentValue,
  feeTiersWithTvl,
  totalTvl,
  isLoadingStats,
  containerKey
}) => {
  const { classes, cx } = useStyles()
  const [blocked, setBlocked] = useState(false)
  const { classes: singleTabClasses } = useSingleTabStyles()
  const [bestTierNode, setBestTierNode] = useState<HTMLElement | null>(null)
  const isPromotedPool = promotedPoolTierIndex !== undefined && promotedPoolTierIndex !== null

  const feeTiersTVLValues = Object.values(feeTiersWithTvl)
  const bestFee = feeTiersTVLValues.length > 0 ? Math.max(...feeTiersTVLValues) : 0
  const bestTierIndex = isPromotedPool
    ? promotedPoolTierIndex!
    : feeTiers.findIndex(tier => feeTiersWithTvl[tier] === bestFee && bestFee > 0)

  const hasValidBestTier = bestTierIndex !== -1

  const [isBestTierHiddenOnLeft, setIsBestTierHiddenOnLeft] = useState(false)
  const [isBestTierHiddenOnRight, setIsBestTierHiddenOnRight] = useState(false)
  const tabsContainerRef = useRef<HTMLDivElement | null>(null)

  const checkBestTierVisibility = () => {
    if (!tabsContainerRef.current || !bestTierNode) return
    const containerRect = tabsContainerRef.current.getBoundingClientRect()
    const bestRect = bestTierNode.getBoundingClientRect()

    setIsBestTierHiddenOnLeft(bestRect.left < containerRect.left)
    setIsBestTierHiddenOnRight(bestRect.right > containerRect.right)
  }

  const doesPoolExist = useCallback(
    (tier: number) => {
      return Object.prototype.hasOwnProperty.call(feeTiersWithTvl, tier)
    },
    [feeTiersWithTvl]
  )

  const getTvlValue = useCallback(
    (tier: number) => {
      const poolExist = doesPoolExist(tier)
      if (!poolExist || feeTiersWithTvl[tier] === 0) return '0'
      if (Object.keys(feeTiersWithTvl).length === 1) return '100'
      const percentage = feeTiersWithTvl[tier]
        ? Math.round((feeTiersWithTvl[tier] / totalTvl) * 100)
        : 0

      if (percentage < 1) return '<1'
      if (percentage > 99) return '>99'
      return `${percentage}`
    },
    [feeTiersWithTvl, totalTvl]
  )

  useLayoutEffect(() => {
    checkBestTierVisibility()
  }, [bestTierNode, feeTiers, promotedPoolTierIndex])
  useLayoutEffect(() => {
    window.addEventListener('resize', checkBestTierVisibility)

    return () => {
      window.removeEventListener('resize', checkBestTierVisibility)
    }
  }, [])

  const { classes: tabsClasses } = useTabsStyles({
    isBestTierHiddenOnLeft,
    isBestTierHiddenOnRight,
    hasValidBestTier,
    isPromotedPool
  })

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    if (!blocked) {
      onSelect(newValue)
      setBlocked(true)
      setTimeout(() => setBlocked(false), 300)
    }
  }

  return (
    <Grid key={containerKey} className={classes.wrapper}>
      <Tabs
        ref={tabsContainerRef}
        onScroll={checkBestTierVisibility}
        onAnimationEnd={checkBestTierVisibility}
        value={currentValue}
        onChange={handleChange}
        variant='scrollable'
        scrollButtons
        TabIndicatorProps={{ children: <span /> }}
        classes={tabsClasses}>
        {feeTiers.map((tier, index) => (
          <Tab
            key={index}
            disableRipple
            ref={index === bestTierIndex ? setBestTierNode : undefined}
            label={
              <Box className={classes.tabContainer}>
                {isLoadingStats || !showTVL ? (
                  <Skeleton animation={false} height={15} width={60} />
                ) : (
                  <Typography
                    className={cx(classes.tabTvl, {
                      [classes.tabSelectedTvl]:
                        currentValue === index ||
                        promotedPoolTierIndex === index ||
                        bestTierIndex === index
                    })}>
                    TVL {getTvlValue(tier)}%
                  </Typography>
                )}
                <Box>{showOnlyPercents ? `${tier}%` : `${tier}% fee`}</Box>
                {isLoadingStats || !showTVL ? (
                  <Skeleton animation={false} height={15} width={60} />
                ) : (
                  <Typography
                    className={cx(classes.tabTvl, {
                      [classes.tabSelectedTvl]:
                        currentValue === index ||
                        promotedPoolTierIndex === index ||
                        bestTierIndex === index
                    })}>
                    {doesPoolExist(tier)
                      ? `$${
                          +formatNumberWithSuffix(feeTiersWithTvl[tier], {
                            noDecimals: true,
                            decimalsAfterDot: 18
                          }) < 1000
                            ? (+formatNumberWithSuffix(feeTiersWithTvl[tier], {
                                noDecimals: true,
                                decimalsAfterDot: 18
                              })).toFixed(2)
                            : formatNumberWithSuffix(feeTiersWithTvl[tier])
                        }`
                      : 'Not created'}
                  </Typography>
                )}
              </Box>
            }
            classes={{
              root: cx(
                singleTabClasses.root,
                index === promotedPoolTierIndex
                  ? singleTabClasses.promoted
                  : index === bestTierIndex
                    ? singleTabClasses.best
                    : undefined
              ),
              selected: singleTabClasses.selected
            }}
          />
        ))}
      </Tabs>
    </Grid>
  )
}

export default FeeSwitch
