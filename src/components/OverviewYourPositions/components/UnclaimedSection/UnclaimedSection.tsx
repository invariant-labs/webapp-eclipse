import { Box, Typography, Button } from '@mui/material'
import { useStyles } from '../Overview/styles'
import { useDispatch } from 'react-redux'
import { actions } from '@store/reducers/positions'

interface UnclaimedSectionProps {
  unclaimedTotal: number
  onClaimAll: () => void
}

export const UnclaimedSection: React.FC<UnclaimedSectionProps> = ({
  unclaimedTotal,
  onClaimAll
}) => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const handleClaimAll = () => {
    dispatch(actions.claimAllFee())
  }

  return (
    <Box className={classes.unclaimedSection}>
      <Typography className={classes.unclaimedTitle}>Unclaimed fees</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography className={classes.unclaimedAmount}>${unclaimedTotal.toFixed(6)}</Typography>
        <Button className={classes.claimAllButton} onClick={handleClaimAll}>
          Claim all fees
        </Button>
      </Box>
    </Box>
  )
}
