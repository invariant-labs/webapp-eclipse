import { Box, Grid } from '@mui/material'
import { StyledCloseButton, StyledText, useStyles } from '../style'
import { TokensDetailsProps } from '@common/Snackbar'
import {
  airdropRainbowIcon,
  circleDolarIcon,
  closeIcon,
  depositIcon,
  snackbarSwapIcon,
  withdrawIcon
} from '@static/icons'
import { colors } from '@static/theme'
import { Separator } from '@common/Separator/Separator'
import { useMemo } from 'react'

interface ITokensDetailsSnackbar extends TokensDetailsProps {
  handleDismiss: () => void
}
const TokensDetailsSnackbar: React.FC<ITokensDetailsSnackbar> = ({
  ikonType,
  tokenXAmount,
  tokenYAmount,
  tokenXIcon,
  tokenYIcon,
  earnedPoints,
  handleDismiss
}) => {
  const { classes } = useStyles()

  const icon = useMemo(() => {
    switch (ikonType) {
      case 'swap':
        return snackbarSwapIcon
      case 'deposit':
        return depositIcon
      case 'withdraw':
        return withdrawIcon
      case 'claim':
        return circleDolarIcon
      default:
        return ''
    }
  }, [ikonType])

  const title = useMemo(() => {
    switch (ikonType) {
      case 'swap':
        return 'Swapped'
      case 'deposit':
        return 'Deposited'
      case 'withdraw':
        return 'Withdrawn'
      case 'claim':
        return 'Claimed'
      default:
        return ''
    }
  }, [ikonType])

  return (
    <>
      <Box className={classes.customSnackbarWrapper}>
        <Grid display='flex' flexDirection='column' flex={1} ml={1}>
          <Grid className={classes.wrapper} gap={0.5}>
            <Grid
              position='relative'
              display='flex'
              alignItems='center'
              width={ikonType === 'swap' || 'claim' ? 18 : 22}>
              <img
                src={icon}
                height={ikonType === 'swap' || 'claim' ? 15 : 18}
                style={{ marginBottom: '2px' }}
              />
            </Grid>
            <StyledText>{title}</StyledText>
            <StyledText color={colors.invariant.green}>{tokenXAmount}</StyledText>
            <img src={tokenXIcon} className={classes.tokenIcon} />
            <StyledText mb={ikonType === 'swap' ? 0.5 : ''}>
              {ikonType === 'swap' ? '→' : '+'}
            </StyledText>
            <StyledText color={colors.invariant.green}>{tokenYAmount}</StyledText>
            <img src={tokenYIcon} className={classes.tokenIcon} />
          </Grid>
          {earnedPoints && (
            <Grid>
              <Separator color={colors.invariant.light} isHorizontal margin='4px 8px 4px 20px' />
              <Grid className={classes.wrapper} gap={0.5}>
                <Box width={18}>
                  <img src={airdropRainbowIcon} />
                </Box>
                <StyledText>Earned Points:</StyledText>
                <StyledText color={colors.invariant.pink}>{earnedPoints}</StyledText>
              </Grid>
            </Grid>
          )}
        </Grid>
        <Grid className={classes.transactionWrapper}>
          <StyledCloseButton onClick={handleDismiss}>
            <img width={16} src={closeIcon} alt='Close' />
          </StyledCloseButton>
        </Grid>
      </Box>
    </>
  )
}

export default TokensDetailsSnackbar
