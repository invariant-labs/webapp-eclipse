import React from 'react'
import { Box } from '@mui/system'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import useStyles from './style'
import { colors } from '@static/theme'
import { LiquidityPlus } from '@static/componentIcon/LiquidityPlus'
import { LiquidityMinus } from '@static/componentIcon/LiquidityMinus'
import { StakeSwitch } from '@store/consts/types'

interface ISwitcher {
  switchTab: string
  setSwitchTab: (newSwitch: StakeSwitch) => void
  isRotating: boolean
  setIsRotating: (isRotating: boolean) => void
}

const Switcher: React.FC<ISwitcher> = ({ switchTab, setSwitchTab, isRotating, setIsRotating }) => {
  const { classes } = useStyles({ switchTab })

  const handleIntervalChange = (_: any, newTab: string) => {
    if (!newTab) return
    setIsRotating(true)

    if (newTab === 'Unstake') {
      setSwitchTab(StakeSwitch.Unstake)
    } else if (newTab === 'Stake') {
      setSwitchTab(StakeSwitch.Stake)
    }

    setTimeout(() => setIsRotating(false), 500)
  }

  return (
    <Box className={classes.mainWrapper}>
      <Box className={classes.switchPoolsContainer}>
        <Box className={classes.switchPoolsMarker} />
        <ToggleButtonGroup
          value={switchTab}
          exclusive
          onChange={handleIntervalChange}
          className={classes.switchButtonsGroup}
          disabled={isRotating}>
          <ToggleButton
            value={StakeSwitch.Stake}
            disableRipple
            className={classes.switchButton}
            style={{
              color:
                switchTab === StakeSwitch.Stake ? colors.invariant.text : colors.invariant.light
            }}>
            {StakeSwitch.Stake}{' '}
            <LiquidityPlus
              style={
                switchTab === StakeSwitch.Stake
                  ? { color: colors.invariant.green, transform: 'scale(1.2)' }
                  : { color: colors.invariant.light }
              }
            />
          </ToggleButton>
          <ToggleButton
            value={StakeSwitch.Unstake}
            disableRipple
            className={classes.switchButton}
            style={{
              color:
                switchTab === StakeSwitch.Unstake ? colors.invariant.text : colors.invariant.light
            }}>
            {StakeSwitch.Unstake}{' '}
            <LiquidityMinus
              style={
                switchTab === StakeSwitch.Unstake
                  ? { color: colors.invariant.green, transform: 'scale(1.2)' }
                  : { color: colors.invariant.light }
              }
            />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  )
}

export default Switcher
