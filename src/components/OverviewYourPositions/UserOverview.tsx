import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  Typography,
  useMediaQuery,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup
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

export enum CardSwitcher {
  Overview = 'Overview',
  Wallet = 'Wallet'
}

export const UserOverview = () => {
  const { classes } = useStyles()
  const tokensList = useSelector(swapTokens)
  const isBalanceLoading = useSelector(balanceLoading)
  const { processedPools, isLoading } = useProcessedTokens(tokensList)
  const isLoadingList = useSelector(isLoadingPositionsList)
  const isDownLg = useMediaQuery(theme.breakpoints.down('lg'))
  const isDownMd = useMediaQuery(theme.breakpoints.down('md'))
  const list: any = useSelector(positionsWithPoolsData)
  const [hideUnknownTokens, setHideUnknownTokens] = useState<boolean>(true)
  const [activePanel, setActivePanel] = useState<CardSwitcher>(CardSwitcher.Overview)

  const handleSwitchPools = (
    _: React.MouseEvent<HTMLElement>,
    newAlignment: CardSwitcher | null
  ) => {
    if (newAlignment !== null) {
      setActivePanel(newAlignment)
    }
  }

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
    <Box
      className={classes.footerCheckboxContainer}
      sx={{ width: '100%', justifyContent: 'space-between' }}>
      {isLoadingList ? (
        <>
          <Skeleton width={120} height={24} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton width={100} height={24} />
            <Skeleton width={100} height={24} />
          </Box>
        </>
      ) : (
        <>
          <Typography className={classNames(classes.greyText, classes.footerPositionDetails)}>
            All positions: {positionsDetails.positionsAmount}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography className={classNames(classes.greenText, classes.footerPositionDetails)}>
              Within range: {positionsDetails.inRageAmount}
            </Typography>
            <Typography className={classNames(classes.pinkText, classes.footerPositionDetails)}>
              Outside range: {positionsDetails.outOfRangeAmount}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  )

  const renderTokensFound = () => (
    <Typography className={classNames(classes.footerText, classes.greyText)}>
      {isBalanceLoading || isLoadingList ? (
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
            marginBottom: isDownLg ? 12 : 20
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

      {isDownLg && !isDownMd && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Overview poolAssets={data} />
            <Box className={classes.footer}>
              <Box className={classes.footerItem}>{renderPositionDetails()}</Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <YourWallet
              pools={finalTokens}
              isLoading={isLoading || isLoadingList || isBalanceLoading}
            />
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
          </Grid>
        </Grid>
      )}

      {isDownMd && (
        <>
          <Grid className={classes.filtersContainer}>
            <Box className={classes.switchPoolsContainer}>
              <Box
                className={classes.switchPoolsMarker}
                sx={{
                  left: activePanel === CardSwitcher.Overview ? 0 : '50%'
                }}
              />
              <ToggleButtonGroup
                value={activePanel}
                exclusive
                onChange={handleSwitchPools}
                className={classes.switchPoolsButtonsGroup}>
                <ToggleButton
                  value={CardSwitcher.Overview}
                  disableRipple
                  className={classes.switchPoolsButton}
                  style={{ fontWeight: activePanel === CardSwitcher.Overview ? 700 : 400 }}>
                  Liquidity overview
                </ToggleButton>
                <ToggleButton
                  value={CardSwitcher.Wallet}
                  disableRipple
                  className={classes.switchPoolsButton}
                  classes={{ disabled: classes.disabledSwitchButton }}
                  style={{ fontWeight: activePanel === CardSwitcher.Wallet ? 700 : 400 }}>
                  Your Wallet
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Grid>

          <Box>
            {activePanel === CardSwitcher.Overview && (
              <>
                <Overview poolAssets={data} />
                <Box className={classes.footer}>
                  <Box className={classes.footerItem}>{renderPositionDetails()}</Box>
                </Box>
              </>
            )}
            {activePanel === CardSwitcher.Wallet && (
              <>
                <YourWallet
                  pools={finalTokens}
                  isLoading={isLoading || isLoadingList || isBalanceLoading}
                />
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
              </>
            )}
          </Box>
        </>
      )}

      {!isDownLg && (
        <>
          <Box
            sx={{
              display: 'flex'
            }}>
            <Overview poolAssets={data} />
            <YourWallet
              pools={finalTokens}
              isLoading={isLoading || isLoadingList || isBalanceLoading}
            />
          </Box>
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
        </>
      )}
    </Box>
  )
}
