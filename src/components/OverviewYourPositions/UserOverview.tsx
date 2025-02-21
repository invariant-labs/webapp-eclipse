import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  Typography,
  useMediaQuery,
  Skeleton
} from '@mui/material'
import { typography, colors, theme } from '@static/theme'
import { Overview } from './components/Overview/Overview'
import { YourWallet } from './components/YourWallet/YourWallet'
import { useSelector } from 'react-redux'
import { balanceLoading, swapTokens } from '@store/selectors/solanaWallet'
import { isLoadingPositionsList, positionsWithPoolsData } from '@store/selectors/positions'
import { DECIMAL, printBN } from '@invariant-labs/sdk-eclipse/lib/utils'
import { ProcessedPool } from '@store/types/userOverview'
import { useProcessedTokens } from '@store/hooks/userOverview/useProcessedToken'
import { useStyles } from './style'
import { useMemo, useState } from 'react'
import classNames from 'classnames'

export const UserOverview = () => {
  const { classes } = useStyles()
  const tokensList = useSelector(swapTokens)
  const isBalanceLoading = useSelector(balanceLoading)
  const { processedPools, isLoading } = useProcessedTokens(tokensList)
  const isLoadingList = useSelector(isLoadingPositionsList)
  const isDownLg = useMediaQuery(theme.breakpoints.down('lg'))
  const list: any = useSelector(positionsWithPoolsData)
  const [hideUnknownTokens, setHideUnknownTokens] = useState<boolean>(true)

  const data: Pick<
    ProcessedPool,
    'id' | 'fee' | 'tokenX' | 'poolData' | 'tokenY' | 'lowerTickIndex' | 'upperTickIndex'
  >[] = list.map(position => {
    return {
      id: position.id.toString() + '_' + position.pool.toString(),
      poolData: position.poolData,
      lowerTickIndex: position.lowerTickIndex,
      upperTickIndex: position.upperTickIndex,
      fee: +printBN(position.poolData.fee, DECIMAL - 2),
      tokenX: {
        decimal: position.tokenX.decimals,
        coingeckoId: position.tokenX.coingeckoId,
        assetsAddress: position.tokenX.address,
        balance: position.tokenX.balance,
        icon: position.tokenX.logoURI,
        name: position.tokenX.symbol
      },
      tokenY: {
        decimal: position.tokenY.decimals,
        balance: position.tokenY.balance,
        assetsAddress: position.tokenY.address,
        coingeckoId: position.tokenY.coingeckoId,
        icon: position.tokenY.logoURI,
        name: position.tokenY.symbol
      }
    }
  })

  const positionsDetails = useMemo(() => {
    const positionsAmount = data.length
    const inRageAmount = data.filter(
      item =>
        item.poolData.currentTickIndex >= Math.min(item.lowerTickIndex, item.upperTickIndex) &&
        item.poolData.currentTickIndex < Math.max(item.lowerTickIndex, item.upperTickIndex)
    ).length
    const outOfRangeAmount = positionsAmount - inRageAmount
    return { positionsAmount, inRageAmount, outOfRangeAmount }
  }, [data])

  const finalTokens = useMemo(() => {
    if (hideUnknownTokens) {
      return processedPools.filter(item => item.icon !== '/unknownToken.svg')
    }
    return processedPools.filter(item => item.decimal > 0)
  }, [processedPools, hideUnknownTokens])

  const renderPositionDetails = () => (
    <Box className={classes.footerCheckboxContainer}>
      {isLoadingList ? (
        <>
          <Skeleton width={120} height={24} />
          <Skeleton width={100} height={24} />
          <Skeleton width={100} height={24} />
        </>
      ) : (
        <>
          <Typography className={classNames(classes.whiteText, classes.footerPositionDetails)}>
            Opened positions: {positionsDetails.positionsAmount}
          </Typography>
          <Typography className={classNames(classes.greenText, classes.footerPositionDetails)}>
            In range: {positionsDetails.inRageAmount}
          </Typography>
          <Typography className={classNames(classes.pinkText, classes.footerPositionDetails)}>
            Out of range: {positionsDetails.outOfRangeAmount}
          </Typography>
        </>
      )}
    </Box>
  )

  const renderTokensFound = () => (
    <Typography className={classNames(classes.footerText, classes.greyText)}>
      {isLoadingList ? (
        <Skeleton width={150} height={24} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
      ) : (
        `${finalTokens.length} tokens were found`
      )}
    </Typography>
  )

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', marginBottom: '24px', width: '100%' }}>
      <Box>
        <Grid
          style={{
            display: 'flex',
            marginBottom: 20
          }}>
          <Typography
            style={{
              color: colors.invariant.text,
              ...typography.heading4,
              fontWeight: 500
            }}>
            Overview
          </Typography>
        </Grid>
      </Box>
      <Box
        sx={{
          display: 'flex',
          [theme.breakpoints.down('lg')]: {
            flexDirection: 'column'
          }
        }}>
        <Overview poolAssets={data} />
        {isDownLg && (
          <Box className={classes.footer}>
            <Box className={classes.footerItem}>{renderPositionDetails()}</Box>
          </Box>
        )}
        <YourWallet
          pools={finalTokens}
          isLoading={isLoading || isLoadingList || isBalanceLoading}
        />
        {isDownLg && (
          <Box className={classes.footer}>
            <Box className={classes.footerItem}>
              <Box className={classes.footerCheckboxContainer}>
                <FormGroup>
                  <FormControlLabel
                    className={classes.checkBoxLabel}
                    control={
                      <Checkbox
                        checked={hideUnknownTokens}
                        className={classes.checkBox}
                        onChange={e => setHideUnknownTokens(e.target.checked)}
                      />
                    }
                    label='Hide unknown tokens'
                  />
                </FormGroup>
              </Box>
              {renderTokensFound()}
            </Box>
          </Box>
        )}
      </Box>
      {!isDownLg && (
        <Grid className={classes.footer}>
          <Grid item xs={6} className={classes.footerItem}>
            {renderPositionDetails()}
          </Grid>
          <Grid item xs={6} className={classes.footerItem}>
            <Box className={classes.footerCheckboxContainer}>
              <FormGroup>
                <FormControlLabel
                  className={classes.checkBoxLabel}
                  control={
                    <Checkbox
                      checked={hideUnknownTokens}
                      className={classes.checkBox}
                      onChange={e => setHideUnknownTokens(e.target.checked)}
                    />
                  }
                  label='Hide unknown tokens'
                />
              </FormGroup>
            </Box>
            {renderTokensFound()}
          </Grid>
        </Grid>
      )}
    </Box>
  )
}
