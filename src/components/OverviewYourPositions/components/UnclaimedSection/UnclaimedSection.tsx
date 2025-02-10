import { Box, Typography, Button } from '@mui/material'
import { useStyles } from '../Overview/styles'
import { useDispatch } from 'react-redux'
import { actions } from '@store/reducers/positions'
import { formatNumber2 } from '@utils/utils'

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
      <Box className={classes.titleRow}>
        <Typography className={classes.unclaimedTitle}>Unclaimed fees (total)</Typography>
        <Typography className={classes.unclaimedAmount}>
          ${formatNumber2(unclaimedTotal)}
        </Typography>
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
