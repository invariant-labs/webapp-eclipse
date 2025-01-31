import React, { useState } from 'react'

import useStyles, { useSingleTabStyles, useTabsStyles } from './style'
import classNames from 'classnames'
import { Grid, Tab, Tabs } from '@mui/material'

export interface IFeeSwitch {
  onSelect: (value: number) => void
  showOnlyPercents?: boolean
  feeTiers: number[]
  bestTierIndex?: number
  currentValue: number
  promotedPoolTierIndex: number | undefined
}

export const FeeSwitch: React.FC<IFeeSwitch> = ({
  onSelect,
  showOnlyPercents = false,
  feeTiers,
  bestTierIndex,
  promotedPoolTierIndex,
  currentValue
}) => {
  const { classes } = useStyles()

  const [blocked, setBlocked] = useState(false)

  const { classes: tabsClasses } = useTabsStyles()
  const { classes: singleTabClasses } = useSingleTabStyles()

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    if (!blocked) {
      onSelect(newValue)
      setBlocked(true)
      setTimeout(() => {
        setBlocked(false)
      }, 200)
    }
  }
  return (
    <Grid className={classes.wrapper}>
      <Tabs
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
            label={showOnlyPercents ? `${tier}%` : `${tier}% fee`}
            classes={{
              root: classNames(
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
