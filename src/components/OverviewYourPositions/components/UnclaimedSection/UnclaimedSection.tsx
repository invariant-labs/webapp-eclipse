import { Box, Typography, Button } from '@mui/material'
import { useStyles } from '../Overview/styles'
import { useDispatch } from 'react-redux'
import { actions } from '@store/reducers/positions'

interface UnclaimedSectionProps {
  unclaimedTotal: number
}

export const UnclaimedSection: React.FC<UnclaimedSectionProps> = ({ unclaimedTotal }) => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const handleClaimAll = () => {
    dispatch(actions.claimAllFee())
  }

  return (
    <Box className={classes.unclaimedSection}>
      <Typography className={classes.unclaimedTitle}>Unclaimed fees (total)</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography className={classes.unclaimedAmount}>${unclaimedTotal.toFixed(6)}</Typography>
      </Box>
      <Button
        className={classes.claimAllButton}
        onClick={handleClaimAll}
        disabled={unclaimedTotal === 0}>
        Claim all
      </Button>
    </Box>
  )
}
