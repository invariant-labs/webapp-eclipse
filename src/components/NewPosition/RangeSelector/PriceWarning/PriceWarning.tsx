import useStyles from './style'
import { Box, Typography } from '@mui/material'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { formatNumberWithSuffix, printBN } from '@utils/utils'
import { ALL_FEE_TIERS_DATA } from '@store/consts/static'
import { DECIMAL } from '@invariant-labs/sdk-eclipse/lib/utils'
import { warning3 } from '@static/icons'

export interface IPriceWarning {
  tokenASymbol: string
  tokenBSymbol: string
  suggestedPrice: number
  oraclePrice: number | null
  currentFeeIndex: number
  bestFeeIndex: number
  showPriceWarning: boolean
  oraclePriceWarning: boolean
  oracleDiffPercentage: number
  diffPercentage: number
}

export const PriceWarning: React.FC<IPriceWarning> = ({
  tokenASymbol,
  tokenBSymbol,
  suggestedPrice,
  oraclePrice,
  currentFeeIndex,
  bestFeeIndex,
  diffPercentage,
  oraclePriceWarning,
  oracleDiffPercentage,
  showPriceWarning
}) => {
  const { classes } = useStyles()

  return (
    <>
      {oraclePrice !== null && oraclePriceWarning && oracleDiffPercentage && (
        <Box className={classes.priceWarningContainer}>
          <TooltipHover
            placement='bottom'
            title={
              bestFeeIndex !== -1 && currentFeeIndex !== -1 ? (
                <Box className={classes.tooltipContainer}>
                  <span className={classes.suggestedPriceTooltipText}>
                    <p>
                      The price in the{' '}
                      <span className={classes.boldedText}>
                        {tokenASymbol}/{tokenBSymbol}{' '}
                        {Number(
                          printBN(ALL_FEE_TIERS_DATA[currentFeeIndex].tier.fee, DECIMAL - 2)
                        ).toFixed(2)}
                        %
                      </span>{' '}
                      pool differs significantly (by over{' '}
                      <span className={classes.boldedText}>{oracleDiffPercentage.toFixed(2)}%</span>
                      ) from the current market price.
                    </p>
                    <p>
                      Please ensure you're opening your position within the correct price range.
                      Opening a position in an incorrect range on this pool can result in a{' '}
                      <span className={classes.boldedText}>loss of value</span> — essentially, it’s
                      like selling your tokens below the market price or buying them above it.
                    </p>
                    <p>
                      As an alternative, consider opening your position in pools closer to the
                      market price of{' '}
                      <span className={classes.boldedText}>
                        {formatNumberWithSuffix(oraclePrice)} {`${tokenBSymbol}/${tokenASymbol}`}
                      </span>
                      .
                    </p>
                  </span>
                </Box>
              ) : (
                ''
              )
            }>
            <img className={classes.priceWarningIcon} src={warning3} alt='warning icon' />
          </TooltipHover>
          <Typography className={classes.priceWarning}>
            The pool price may differ from market price
          </Typography>
        </Box>
      )}

      {suggestedPrice !== 0 && showPriceWarning && diffPercentage && !oraclePriceWarning && (
        <Box className={classes.priceWarningContainer}>
          <TooltipHover
            placement='bottom'
            title={
              bestFeeIndex !== -1 && currentFeeIndex !== -1 ? (
                <Box className={classes.tooltipContainer}>
                  <span className={classes.suggestedPriceTooltipText}>
                    <p>
                      The price on the{' '}
                      <span className={classes.boldedText}>
                        {tokenASymbol}/{tokenBSymbol}{' '}
                        {Number(
                          printBN(ALL_FEE_TIERS_DATA[currentFeeIndex].tier.fee, DECIMAL - 2)
                        ).toFixed(2)}
                        %
                      </span>{' '}
                      pool differs significantly (over{' '}
                      <span className={classes.boldedText}>{diffPercentage.toFixed(2)}% </span>)
                      from the most liquid{' '}
                      <span className={classes.boldedText}>
                        {tokenASymbol}/{tokenBSymbol}{' '}
                        {Number(
                          printBN(ALL_FEE_TIERS_DATA[bestFeeIndex].tier.fee, DECIMAL - 2)
                        ).toFixed(2)}
                        %{' '}
                      </span>
                      market.
                    </p>
                    <p>
                      Please ensure you're opening your position within the correct price range.
                      Opening a position with an incorrect range on this pool can result in a{' '}
                      <span className={classes.boldedText}>loss of value</span> — essentially, it's
                      like selling your tokens below the current market price or buying them above
                      it.
                    </p>
                    <p>
                      As an alternative, consider using the{' '}
                      <span className={classes.boldedText}>
                        {tokenASymbol}/{tokenBSymbol}{' '}
                        {Number(
                          printBN(ALL_FEE_TIERS_DATA[bestFeeIndex].tier.fee, DECIMAL - 2)
                        ).toFixed(2)}
                        %{' '}
                      </span>
                      pool, which is the most liquid market.
                    </p>
                  </span>
                </Box>
              ) : (
                ''
              )
            }>
            <img className={classes.priceWarningIcon} src={warning3} alt='warning icon' />
          </TooltipHover>
          <Typography className={classes.priceWarning}>
            The pool price may differ from the actual price
          </Typography>
        </Box>
      )}
    </>
  )
}

export default PriceWarning
