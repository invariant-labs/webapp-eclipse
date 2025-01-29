import { Box, Typography, Button } from '@mui/material'
import { useStyles } from '../Overview/styles'

interface UnclaimedSectionProps {
  unclaimedTotal: number
  onClaimAll: () => void
}

export const UnclaimedSection: React.FC<UnclaimedSectionProps> = ({
  unclaimedTotal,
  onClaimAll
}) => {
  const { classes } = useStyles()

  return (
    <Box className={classes.unclaimedSection}>
      <Typography className={classes.unclaimedTitle}>Unclaimed fees</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography className={classes.unclaimedAmount}>${unclaimedTotal.toFixed(6)}</Typography>
        <Button className={classes.claimAllButton} onClick={onClaimAll}>
          Claim all fees
        </Button>
      </Box>
    </Box>
  )
}
