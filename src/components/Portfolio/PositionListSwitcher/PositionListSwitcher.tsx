import { LiquidityPools } from '@store/reducers/positions'
import { useStyles } from './style'
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material'

interface IPositionListSwitcher {
  alignment: LiquidityPools
  setLiquidityPoolsAlignment: (alignment: LiquidityPools) => void
  lockListDisabled: boolean
}

export const PositionListSwitcher: React.FC<IPositionListSwitcher> = ({
  alignment,
  setLiquidityPoolsAlignment,
  lockListDisabled
}) => {
  const { classes } = useStyles()

  return (
    <Box className={classes.switchPoolsContainer}>
      <Box
        className={classes.switchPoolsMarker}
        sx={{
          left: alignment === LiquidityPools.Standard ? 0 : '50%'
        }}
      />
      <ToggleButtonGroup
        value={alignment}
        exclusive
        onChange={(_event, newAlignment) => {
          if (newAlignment !== null) {
            setLiquidityPoolsAlignment(newAlignment)
          }
        }}
        className={classes.switchPoolsButtonsGroup}>
        <ToggleButton
          sx={{ padding: 0 }}
          value={LiquidityPools.Standard}
          disableRipple
          className={classes.switchPoolsButton}
          style={{ fontWeight: alignment === LiquidityPools.Standard ? 700 : 400 }}>
          Standard
        </ToggleButton>
        <ToggleButton
          sx={{ padding: 0 }}
          disabled={lockListDisabled}
          value={LiquidityPools.Locked}
          disableRipple
          className={classes.switchPoolsButton}
          classes={{ disabled: classes.disabledSwitchButton }}
          style={{ fontWeight: alignment === LiquidityPools.Locked ? 700 : 400 }}>
          Locked
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}
