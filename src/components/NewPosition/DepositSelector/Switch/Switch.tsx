import { styled, Switch } from '@mui/material'
import { colors } from '@static/theme'

export const AllFundsSwitch = styled(Switch)(({ theme }) => ({
  width: 26,
  height: 14,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 1,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      '& + .MuiSwitch-track': {
        opacity: 1,
        background: colors.invariant.greenLinearGradientOpacity
      }
    }
  },
  '& .MuiSwitch-thumb': {
    width: 12,
    height: 12,
    backgroundColor: colors.invariant.textGrey,
    transition: theme.transitions.create(['width'], {
      duration: 200
    })
  },
  '& .MuiSwitch-track': {
    boxSizing: 'border-box',
    border: `1px solid ${colors.invariant.light}`
  }
}))
