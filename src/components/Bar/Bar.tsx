import { Settings } from './Settings/Settings'
import Box from '@mui/material/Box'
import { useStyles } from './style'
import { Chain } from './Chain/Chain'

export const Bar = () => {
  const { classes } = useStyles()

  return (
    <Box className={classes.buttonContainer}>
      <Settings />
      <Chain />
    </Box>
  )
}
