import { Button } from '@mui/material'
import { useStyles } from './style'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { forwardRef, Ref } from 'react'

type Props = {
  children?: React.ReactNode
  showArrowDown?: boolean
  onClick?: () => void
}

export const BarButton = forwardRef(
  ({ children, showArrowDown, onClick = () => {} }: Props, ref: Ref<HTMLButtonElement>) => {
    const { classes } = useStyles()

    return (
      <Button className={classes.headerButton} ref={ref} onClick={() => onClick()}>
        {children}
        {showArrowDown && <KeyboardArrowDownIcon />}
      </Button>
    )
  }
)
