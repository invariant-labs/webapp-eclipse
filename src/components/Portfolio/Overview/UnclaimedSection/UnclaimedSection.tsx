import { Box, Typography, Skeleton, useMediaQuery } from '@mui/material'
import { formatNumberWithoutSuffix } from '@utils/utils'
import { theme } from '@static/theme'
import loadingAnimation from '@static/gif/loading.gif'
import { useStyles } from './styles'
import { Button } from '@common/Button/Button'

interface IUnclaimed {
  totalUnlocked: number
  totalLocked: number
}

interface UnclaimedSectionProps {
  unclaimedTotal: IUnclaimed
  handleClaimAll?: () => void
  loading?: boolean
}

export const UnclaimedSection: React.FC<UnclaimedSectionProps> = ({
  unclaimedTotal,
  handleClaimAll,
  loading = false
}) => {
  const total = unclaimedTotal.totalLocked + unclaimedTotal.totalUnlocked
  const { classes } = useStyles({ isLoading: loading || unclaimedTotal.totalUnlocked === 0 })
  const isLg = useMediaQuery(theme.breakpoints.down('lg'))

  return (
    <Box className={classes.unclaimedSection}>
      <Box className={classes.titleRow}>
        <Box className={classes.container}>
          <Typography className={classes.unclaimedTitle}>Unclaimed fees (total)</Typography>
          {!isLg && (
            <Box ml={4}>
              <Button
                scheme='green'
                height={32}
                width={105}
                padding='0 20px'
                onClick={handleClaimAll}
                disabled={loading || unclaimedTotal.totalUnlocked === 0}>
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
            </Box>
          )}
        </Box>

        {loading ? (
          <Skeleton variant='text' width={100} height={30} className={classes.unclaimedAmount} />
        ) : (
          <Typography className={classes.unclaimedAmount}>
            ${formatNumberWithoutSuffix(total, { twoDecimals: true })}
          </Typography>
        )}
      </Box>
      {isLg && (
        <Button
          scheme='green'
          height={32}
          width={'100%'}
          onClick={handleClaimAll}
          disabled={loading || unclaimedTotal.totalUnlocked === 0}>
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
