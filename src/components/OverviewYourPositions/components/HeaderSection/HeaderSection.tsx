import { Typography, Box } from '@mui/material'
import { useStyles } from '../Overview/styles'
import { formatNumber2 } from '@utils/utils'

interface HeaderSectionProps {
  totalValue: number
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ totalValue }) => {
  const { classes } = useStyles()

  return (
    <>
      <Box className={classes.headerRow}>
        <Typography className={classes.headerText}>Assets in Pools</Typography>
        <Typography className={classes.headerText}>${formatNumber2(totalValue)}</Typography>
      </Box>
    </>
  )
}
