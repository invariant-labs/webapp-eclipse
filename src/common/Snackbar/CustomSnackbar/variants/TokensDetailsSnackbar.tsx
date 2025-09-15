import { Box, Grid } from '@mui/material'
import { StyledCloseButton, StyledText, useStyles } from '../style'
import { TokensDetailsProps } from '@common/Snackbar'
import {
  circleDolarIcon,
  closeIcon,
  depositIcon,
  snackbarSwapIcon,
  stakeIcon,
  unstakeIcon,
  withdrawIcon
} from '@static/icons'
import { colors } from '@static/theme'
import { Separator } from '@common/Separator/Separator'
import { useMemo } from 'react'

interface ITokensDetailsSnackbar extends TokensDetailsProps {
  handleDismiss: () => void
}

const arrow = (
  <svg width='24' height='17' viewBox='0 0 22 19' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path d='M21 8.64062H0' stroke='#ffffff' strokeWidth='1.2' />
    <path d='M15 5.14057L22 8.64057L15 12.1406' stroke='#ffffff' strokeWidth='1.2' />
  </svg>
)

const TokensDetailsSnackbar: React.FC<ITokensDetailsSnackbar> = ({
  ikonType,
  tokenXAmount,
  tokenBetweenAmount,
  tokenYAmount,
  tokenXIcon,
  tokenBetweenIcon,
  tokenYIcon,
  tokenXSymbol,
  tokenBetweenSymbol,
  tokenYSymbol,
  handleDismiss,
  tokenXAmountAutoSwap,
  tokenYAmountAutoSwap,
  tokenXIconAutoSwap,
  tokenYIconAutoSwap,
  roundIcon
}) => {
  const { classes } = useStyles({ roundIcon })

  const icon = useMemo(() => {
    switch (ikonType) {
      case 'swap':
        return snackbarSwapIcon
      case 'deposit':
      case 'purchase':
        return depositIcon
      case 'withdraw':
        return withdrawIcon
      case 'claim':
        return circleDolarIcon
      case 'claim-nft':
        return circleDolarIcon
      case 'stake':
        return stakeIcon
      case 'unstake':
        return unstakeIcon
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
      case 'purchase':
        return 'Purchased'
      case 'withdraw':
        return 'Withdrawn'
      case 'claim':
        return 'Claimed'
      case 'claim-nft':
        return 'Claimed NFT'
      case 'stake':
        return 'Staked:'
      case 'unstake':
        return 'Unstaked:'
      default:
        return ''
    }
  }, [ikonType])
  const hasXAmount = !!tokenXAmount && tokenXAmount !== '0'
  const hasYAmount = !!tokenYAmount && tokenYAmount !== '0'
  const hasBothAmounts = hasXAmount && hasYAmount
  return (
    <>
      <Box
        className={classes.customSnackbarWrapper}
        paddingTop={tokenXAmountAutoSwap ? '8px' : '0'}>
        <Grid display='flex' flexDirection='column' flex={1} ml={1} gap={0.7}>
          {tokenXIconAutoSwap && tokenYAmountAutoSwap && (
            <>
              <Grid>
                <Grid className={classes.wrapper} gap={0.5}>
                  <Grid position='relative' display='flex' alignItems='center' width={22}>
                    <img src={snackbarSwapIcon} height={15} style={{ marginBottom: '2px' }} />
                  </Grid>
                  <StyledText>Swapped</StyledText>
                  <StyledText color={colors.invariant.green}>{tokenXAmountAutoSwap}</StyledText>
                  <img src={tokenXIconAutoSwap} className={classes.tokenIcon} />
                  {arrow}
                  <StyledText color={colors.invariant.green}>{tokenYAmountAutoSwap}</StyledText>
                  <img src={tokenYIconAutoSwap} className={classes.tokenIcon} />
                </Grid>
              </Grid>
              <Separator color={colors.invariant.light} isHorizontal margin='0px 8px 0px 20px' />
            </>
          )}
          <Grid className={classes.wrapper} gap={0.5}>
            <Grid
              position='relative'
              display='flex'
              alignItems='center'
              width={
                ikonType === 'swap' ||
                ikonType === 'unstake' ||
                ikonType === 'stake' ||
                ikonType === 'claim' ||
                ikonType === 'claim-nft'
                  ? 18
                  : 22
              }>
              <img
                src={icon}
                height={
                  ikonType === 'swap' ||
                  ikonType === 'claim' ||
                  ikonType === 'unstake' ||
                  ikonType === 'stake'
                    ? 15
                    : 18
                }
                style={{ marginBottom: '2px' }}
              />
            </Grid>
            <StyledText>{title}</StyledText>
            {(hasXAmount || ikonType === 'claim-nft') && (
              <>
                {hasXAmount ? (
                  <StyledText color={colors.invariant.green}>{tokenXAmount}</StyledText>
                ) : (
                  <span> </span>
                )}
                {tokenXIcon === '/unknownToken.svg' ? (
                  <StyledText>{tokenXSymbol}</StyledText>
                ) : (
                  <img src={tokenXIcon} className={classes.tokenIcon} />
                )}
              </>
            )}
            {hasYAmount && (
              <>
                {ikonType === 'swap' ||
                ikonType === 'unstake' ||
                ikonType === 'stake' ||
                ikonType === 'purchase' ? (
                  arrow
                ) : hasBothAmounts ? (
                  <StyledText>+</StyledText>
                ) : null}
                <StyledText color={colors.invariant.green}>
                  {tokenBetweenAmount ? tokenBetweenAmount : tokenYAmount}
                </StyledText>
                {(
                  tokenBetweenAmount
                    ? tokenBetweenIcon === '/unknownToken.svg'
                    : tokenYIcon === '/unknownToken.svg'
                ) ? (
                  <StyledText>{tokenBetweenAmount ? tokenBetweenSymbol : tokenYSymbol}</StyledText>
                ) : (
                  <img
                    src={tokenBetweenAmount ? tokenBetweenIcon : tokenYIcon}
                    className={classes.tokenIcon}
                  />
                )}
              </>
            )}
          </Grid>

          {tokenBetweenAmount && (
            <>
              <Separator color={colors.invariant.light} isHorizontal margin='0px 8px 0px 20px' />
              <Grid className={classes.wrapper} gap={0.5}>
                <Grid
                  position='relative'
                  display='flex'
                  alignItems='center'
                  width={ikonType === 'swap' ? 18 : 22}>
                  <img
                    src={icon}
                    height={ikonType === 'swap' ? 15 : 18}
                    style={{ marginBottom: '2px' }}
                  />
                </Grid>
                <StyledText>{title}</StyledText>
                <StyledText color={colors.invariant.green}>{tokenBetweenAmount}</StyledText>
                {tokenBetweenIcon === '/unknownToken.svg' ? (
                  <StyledText>{tokenBetweenSymbol}</StyledText>
                ) : (
                  <img src={tokenBetweenIcon} className={classes.tokenIcon} />
                )}

                {ikonType === 'swap' ? arrow : <StyledText>+</StyledText>}
                <StyledText color={colors.invariant.green}>{tokenYAmount}</StyledText>
                {tokenYIcon === '/unknownToken.svg' ? (
                  <StyledText>{tokenYSymbol}</StyledText>
                ) : (
                  <img src={tokenYIcon} className={classes.tokenIcon} />
                )}
              </Grid>
            </>
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
