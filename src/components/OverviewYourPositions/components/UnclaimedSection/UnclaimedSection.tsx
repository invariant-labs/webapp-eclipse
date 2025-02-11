import { Box, Typography, Button, Skeleton } from '@mui/material'
import { useStyles } from '../Overview/styles'
import { useDispatch } from 'react-redux'
import { actions } from '@store/reducers/positions'
import { formatNumber2 } from '@utils/utils'

interface UnclaimedSectionProps {
  unclaimedTotal: number
  loading?: boolean // Add loading prop
}

export const UnclaimedSection: React.FC<UnclaimedSectionProps> = ({
  unclaimedTotal,
  loading = false
}) => {
  const { classes } = useStyles()
  const dispatch = useDispatch()

  const handleClaimAll = () => {
    dispatch(actions.claimAllFee())
  }

  return (
    <Box className={classes.unclaimedSection}>
      <Box className={classes.titleRow}>
        <Typography className={classes.unclaimedTitle}>Unclaimed fees (total)</Typography>
        {loading ? (
          <Skeleton variant='text' width={100} height={30} className={classes.unclaimedAmount} />
        ) : (
          <Typography className={classes.unclaimedAmount}>
            ${formatNumber2(unclaimedTotal)}
          </Typography>
        )}
      </Box>
      <Button
        className={classes.claimAllButton}
        onClick={handleClaimAll}
        disabled={loading || unclaimedTotal === 0}>
        Claim all
      </Button>
    </Box>
  )
}
