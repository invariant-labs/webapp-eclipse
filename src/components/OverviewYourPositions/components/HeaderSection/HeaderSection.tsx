import { Typography, Box } from '@mui/material'
import { useStyles } from '../Overview/styles'

interface HeaderSectionProps {
  totalValue: number
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ totalValue }) => {
  const { classes } = useStyles()

  return (
    <>
      <Typography className={classes.subtitle}>Interest's fee</Typography>
      <Box className={classes.headerRow}>
        <Typography className={classes.headerText}>Assets in Pools</Typography>
        <Typography className={classes.headerText}>${totalValue.toFixed(2)}</Typography>
      </Box>
    </>
  )
}
