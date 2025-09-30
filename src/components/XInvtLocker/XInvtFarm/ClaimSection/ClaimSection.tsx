import { Button } from '@common/Button/Button'
import { Box, Grid, Skeleton, Typography } from '@mui/material'
import { INVT_MAIN } from '@store/consts/static'
import useStyles from './style'
import { UserPoints } from '@store/reducers/xInvt'
import { formatNumberWithSuffix } from '@utils/utils'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'

interface IProps {
  handleClaim: () => void
  userPointsState: UserPoints
  isLoading: boolean
  walletConnected: boolean
}
export const ClaimSection: React.FC<IProps> = ({
  handleClaim,
  userPointsState,
  isLoading,
  walletConnected
}) => {
  const { classes } = useStyles()

  return (
    <Box className={classes.wrapper}>
      <Grid className={classes.valueWrapper}>
        <Typography component='h5'>Current round</Typography>
        {isLoading ? (
          <Skeleton variant='rounded' width={60} height={24} />
        ) : (
          <Box display={'flex'} alignItems={'center'} gap={0.5}>
            {walletConnected ? (
              <>
                <img width={20} height={20} src={INVT_MAIN.logoURI} />
                <Typography component='h3'>
                  {formatNumberWithSuffix(userPointsState?.accumulatedRewards || '0')}
                </Typography>
              </>
            ) : (
              <Typography component='h3'>-</Typography>
            )}
          </Box>
        )}
      </Grid>
      <Grid className={classes.claimWrapper}>
        <Box display={'flex'} alignItems={'center'} className={classes.claimValue}>
          <Typography component='h5'>Unclaimed</Typography>
          {isLoading ? (
            <Skeleton variant='rounded' width={60} height={24} />
          ) : (
            <Box display={'flex'} alignItems={'center'} gap={0.5}>
              {walletConnected ? (
                <>
                  <img width={20} height={20} src={INVT_MAIN.logoURI} />
                  <Typography component='h3'>
                    {formatNumberWithSuffix(userPointsState?.claimableRewards || '0')}
                  </Typography>
                </>
              ) : (
                <Typography component='h3'>-</Typography>
              )}
            </Box>
          )}
        </Box>
        <TooltipHover
          textAlign='center'
          title={
            walletConnected
              ? !+userPointsState?.claimableRewards
                ? 'Claim will be available after finish of current round'
                : ''
              : 'Connect wallet to see your available INVT'
          }>
          <Button
            width={'100%'}
            scheme='green'
            onClick={handleClaim}
            disabled={!+userPointsState?.claimableRewards || isLoading}>
            Claim
          </Button>
        </TooltipHover>
      </Grid>
    </Box>
  )
}
