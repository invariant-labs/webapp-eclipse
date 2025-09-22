import React from 'react'
import { Box } from '@mui/system'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import useStyles from './style'
import { colors } from '@static/theme'
import { LiquidityPlus } from '@static/componentIcon/LiquidityPlus'
import { LiquidityMinus } from '@static/componentIcon/LiquidityMinus'
import { LockerSwitch } from '@store/consts/types'
import { inputTarget } from '@store/consts/static'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'

interface ISwitcher {
  switchTab: string
  setSwitchTab: (newSwitch: LockerSwitch) => void
  setInputRef: (val: inputTarget) => void
  isRotating: boolean
  setIsRotating: (isRotating: boolean) => void
  unlockDisabled?: boolean
  lockDisabled?: boolean
}

const Switcher: React.FC<ISwitcher> = ({
  switchTab,
  setSwitchTab,
  isRotating,
  setInputRef,
  setIsRotating,
  unlockDisabled,
  lockDisabled
}) => {
  const { classes } = useStyles({ switchTab })

  const handleIntervalChange = (_: any, newTab: string) => {
    if (unlockDisabled || lockDisabled) return
    if (!newTab) return

    setIsRotating(true)
    setInputRef(inputTarget.FROM)

    if (newTab === 'Unlock') {
      setSwitchTab(LockerSwitch.Unlock)
    } else if (newTab === 'Lock') {
      setSwitchTab(LockerSwitch.Lock)
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
            value={LockerSwitch.Lock}
            disableRipple
            className={classes.switchButton}
            style={{
              color:
                switchTab === LockerSwitch.Lock ? colors.invariant.text : colors.invariant.light
            }}
            disabled={lockDisabled}>
            Get xINVT{' '}
            <LiquidityPlus
              style={
                switchTab === LockerSwitch.Lock
                  ? { color: colors.invariant.text }
                  : { color: colors.invariant.light }
              }
            />
          </ToggleButton>

          <ToggleButton
            value={LockerSwitch.Unlock}
            disableRipple
            className={classes.switchButton}
            style={{
              color:
                switchTab === LockerSwitch.Unlock ? colors.invariant.text : colors.invariant.light
            }}
            disabled={unlockDisabled}>
            <TooltipHover
              title={unlockDisabled ? 'Available after end of 3 months lock period' : ''}
              className={classes.tooltip}>
              <>
                Redeem INVT{' '}
                <LiquidityMinus
                  style={
                    switchTab === LockerSwitch.Unlock
                      ? { color: colors.invariant.text }
                      : { color: colors.invariant.light }
                  }
                />
              </>
            </TooltipHover>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  )
}

export default Switcher
