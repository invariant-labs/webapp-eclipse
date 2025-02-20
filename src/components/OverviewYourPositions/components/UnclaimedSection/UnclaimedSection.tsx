import { Box, Typography, Button, Skeleton, useMediaQuery } from '@mui/material'
import { useStyles } from '../Overview/styles'
import { useDispatch } from 'react-redux'
import { actions } from '@store/reducers/positions'
import { formatNumberWithoutSuffix } from '@utils/utils'
import { theme } from '@static/theme'
import loadingAnimation from '@static/gif/loading.gif'

interface UnclaimedSectionProps {
  unclaimedTotal: number
  loading?: boolean
}

export const UnclaimedSection: React.FC<UnclaimedSectionProps> = ({
  unclaimedTotal,
  loading = false
}) => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const isLg = useMediaQuery(theme.breakpoints.down('lg'))
  const handleClaimAll = () => {
    dispatch(actions.claimAllFee())
  }

  return (
    <Box className={classes.unclaimedSection}>
      <Box className={classes.titleRow}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <Typography className={classes.unclaimedTitle}>Unclaimed fees (total)</Typography>
          {!isLg && (
            <Button
              className={classes.claimAllButton}
              onClick={handleClaimAll}
              disabled={loading || unclaimedTotal === 0}>
              {loading ? (
                <>
                  <img
                    src={loadingAnimation}
                    style={{ height: 25, width: 25, zIndex: 10 }}
                    alt='loading'
                  />
                </>
              ) : (
                'Claim All'
              )}
            </Button>
          )}
        </Box>

        {loading ? (
          <Skeleton variant='text' width={100} height={30} className={classes.unclaimedAmount} />
        ) : (
          <Typography className={classes.unclaimedAmount}>
            ${formatNumberWithoutSuffix(unclaimedTotal, { twoDecimals: true })}
          </Typography>
        )}
      </Box>
      {isLg && (
        <Button
          className={classes.claimAllButton}
          onClick={handleClaimAll}
          disabled={loading || unclaimedTotal === 0}>
          {loading ? (
            <>
              <img
                src={loadingAnimation}
                style={{ height: 25, width: 25, zIndex: 10 }}
                alt='loading'
              />
            </>
          ) : (
            'Claim All'
          )}
        </Button>
      )}
    </Box>
  )
}
