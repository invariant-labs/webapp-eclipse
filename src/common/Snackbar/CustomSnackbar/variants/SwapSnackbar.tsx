import { Box, Grid } from '@mui/material'
import { StyledCloseButton, StyledText, useStyles } from '../style'
import { SwapSnackbarProps } from '@common/Snackbar'
import { airdropRainbowIcon, closeIcon, snackbarSwapIcon } from '@static/icons'
import { colors } from '@static/theme'
import { Separator } from '@common/Separator/Separator'

interface ISwapSnackbars extends SwapSnackbarProps {
  handleDismiss: () => void
}
const SwapSnackbar: React.FC<ISwapSnackbars> = ({
  amountIn,
  amountOut,
  ikonFrom,
  ikonTo,
  earnedPoints,
  handleDismiss
}) => {
  const { classes } = useStyles()

  return (
    <>
      <Box className={classes.customSnackbarWrapper}>
        <Grid display='flex' flexDirection='column' flex={1} ml={1}>
          <Grid className={classes.wrapper} gap={0.5}>
            <Box width={18}>
              <img src={snackbarSwapIcon} width={15} />
            </Box>
            <StyledText>Swapped</StyledText>
            <StyledText color={colors.invariant.green}>{amountIn}</StyledText>
            <img src={ikonFrom} width={16} height={16} style={{ marginBottom: '2px' }} />
            <StyledText mb={0.5}>→</StyledText>
            <StyledText color={colors.invariant.green}>{amountOut}</StyledText>
            <img src={ikonTo} width={16} height={16} style={{ marginBottom: '2px' }} />
          </Grid>
          {earnedPoints && (
            <Grid>
              <Separator color={colors.invariant.light} isHorizontal margin='4px 8px 4px 20px' />
              <Grid className={classes.wrapper} gap={0.5}>
                <Box width={18}>
                  <img src={airdropRainbowIcon} />
                </Box>
                <StyledText>Earned Points:</StyledText>
                <StyledText color={colors.invariant.pink}>{earnedPoints}</StyledText>=
              </Grid>
            </Grid>
          )}
        </Grid>
        <Grid className={classes.transactionWrapper}>
          <StyledCloseButton onClick={handleDismiss}>
            <img width={16} src={closeIcon} alt='Close'></img>
          </StyledCloseButton>
        </Grid>
      </Box>
    </>
  )
}

export default SwapSnackbar
