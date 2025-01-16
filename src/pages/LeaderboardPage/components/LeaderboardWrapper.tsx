import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import useStyles from './styles'
import { Faq } from './Faq/Faq'
import LeaderboardList from './LeaderboardList/LeaderboardList'
import { useDispatch, useSelector } from 'react-redux'
import { actions, LeaderBoardType } from '@store/reducers/leaderboard'
import { getPromotedPools, lastTimestamp, leaderboardSelectors } from '@store/selectors/leaderboard'
import { actions as snackbarActions } from '@store/reducers/snackbars'
import { actions as positionListActions } from '@store/reducers/positions'
import { YourProgress } from './YourProgress/YourProgress'
import { TopScorers } from './TopScorers/TopScorers'
import { Switcher } from './Switcher/Switcher'
import { RewardedPools } from './RewardedPools/RewardedPools'
import { network } from '@store/selectors/solanaConnection'
import { VariantType } from 'notistack'
import { poolsStatsWithTokensDetails } from '@store/selectors/stats'
import { actions as statsActions } from '@store/reducers/stats'
import { positionsWithPoolsData } from '@store/selectors/positions'
import { estimatePointsForUserPositions } from '@invariant-labs/points-sdk'
import { BN } from '@coral-xyz/anchor'
import { LEADERBOARD_DECIMAL } from '../config'
import { PoolStructure, Position } from '@invariant-labs/sdk-eclipse/src/market'
import { isLoadingPositionsList } from '@store/selectors/positions'
import { WarningBanner } from './WarningBanner/WarningBanner'
import { checkDataDelay, hexToDate } from '@utils/utils'
import icons from '@static/icons'
import { blurContent, unblurContent } from '@utils/uiUtils'
import LeaderboardTypeModal from '@components/Modals/LeaderboardTypeModal/LeaderboardTypeModal'

const BANNER_STORAGE_KEY = 'invariant-warning-banner'
const BANNER_HIDE_DURATION = 1000 * 60 * 60 * 1 // 1 hour
const SNAP_TIME_DELAY = 60 * 4 // IN MINUTES (4 hours)
interface LeaderboardWrapperProps {
  alignment: string
  setAlignment: React.Dispatch<React.SetStateAction<string>>
}

export const LeaderboardWrapper: React.FC<LeaderboardWrapperProps> = ({
  alignment,
  setAlignment
}) => {
  const { classes } = useStyles()
  const currentNetwork = useSelector(network)

  const lastSnapTimestamp = useSelector(lastTimestamp)
  const userStats = useSelector(leaderboardSelectors.currentUser)
  const top3Scorers = useSelector(leaderboardSelectors.top3Scorers)
  const list = useSelector(positionsWithPoolsData)
  const dispatch = useDispatch()
  const itemsPerPage = useSelector(leaderboardSelectors.itemsPerPage)
  const type = useSelector(leaderboardSelectors.type)
  const promotedPools = useSelector(getPromotedPools)
  const poolsList = useSelector(poolsStatsWithTokensDetails)
  const isLoadingList = useSelector(isLoadingPositionsList)

  const [showWarningBanner, setShowWarningBanner] = React.useState(true)

  const isDelayWarning = useMemo(() => {
    if (!lastSnapTimestamp) return false
    const snapTime = hexToDate(lastSnapTimestamp)

    return checkDataDelay(snapTime, SNAP_TIME_DELAY)
  }, [lastSnapTimestamp])

  const promotedPoolsData = promotedPools
    .map(promotedPool =>
      poolsList.find(poolWithData => poolWithData.poolAddress.toString() === promotedPool.address)
    )
    .filter(poolData => !!poolData)
    .map(poolWithData => {
      return {
        ...poolWithData,
        pointsPerSecond: promotedPools.find(
          promotedPool => poolWithData.poolAddress.toString() === promotedPool.address
        )!.pointsPerSecond
      }
    })
  useEffect(() => {
    dispatch(actions.getLeaderboardData({ page: 1, itemsPerPage }))
    dispatch(actions.getLeaderboardConfig())
    dispatch(statsActions.getCurrentStats())
    dispatch(positionListActions.getPositionsList())
  }, [dispatch, itemsPerPage])

  const estimated24hPoints = useMemo(() => {
    const eligiblePositions = {}
    list.forEach(position => {
      if (promotedPools.some(pool => pool.address === position.pool.toString())) {
        const v = eligiblePositions[position.pool.toString()]
        if (!v) {
          eligiblePositions[position.pool.toString()] = [position]
        } else {
          eligiblePositions[position.pool.toString()].push(position)
        }
      }
    })

    const estimation: BN = Object.values(eligiblePositions).reduce((acc: BN, positions: any) => {
      const estimation = estimatePointsForUserPositions(
        positions as Position[],
        positions[0].poolData as PoolStructure,
        new BN(
          promotedPools.find(
            pool => pool.address === positions[0].pool.toString()
          )!.pointsPerSecond,
          'hex'
        ).mul(new BN(10).pow(new BN(LEADERBOARD_DECIMAL)))
      )

      return acc.add(estimation)
    }, new BN(0))

    return estimation
  }, [userStats, list])

  const content = React.useMemo(() => {
    if (alignment === 'leaderboard') {
      return <LeaderboardList />
    } else if (alignment === 'faq') {
      return <Faq />
    }
  }, [alignment])

  const copyAddressHandler = (message: string, variant: VariantType) => {
    dispatch(
      snackbarActions.add({
        message,
        variant,
        persist: false
      })
    )
  }

  const [isHiding, setIsHiding] = React.useState(false)

  const handleBannerClose = () => {
    setIsHiding(true)
    setTimeout(() => {
      setShowWarningBanner(false)
      localStorage.setItem(
        BANNER_STORAGE_KEY,
        JSON.stringify({
          hiddenAt: new Date().getTime()
        })
      )
      setIsHiding(false)
    }, 300)
  }

  useLayoutEffect(() => {
    const checkBannerState = () => {
      const storedData = localStorage.getItem(BANNER_STORAGE_KEY)
      if (storedData) {
        try {
          const { hiddenAt } = JSON.parse(storedData)
          const currentTime = new Date().getTime()
          if (currentTime - hiddenAt < BANNER_HIDE_DURATION) {
            setShowWarningBanner(false)
          } else {
            localStorage.removeItem(BANNER_STORAGE_KEY)
            setShowWarningBanner(true)
          }
        } catch (error) {
          console.error('Error parsing banner state:', error)
          localStorage.removeItem(BANNER_STORAGE_KEY)
        }
      }
    }

    checkBannerState()
  }, [])

  const [menuOpen, setMenuOpen] = useState(false)
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [selectedOption, setSelectedOption] = useState<LeaderBoardType>('Total points')
  const availableOptions: LeaderBoardType[] = ['Liquidity', 'Swap', 'Total points']
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    blurContent()
    setMenuOpen(true)
  }

  const handleClose = () => {
    unblurContent()
    setMenuOpen(false)
  }
  useEffect(() => {
    dispatch(actions.setLeaderBoardType(selectedOption))
  }, [selectedOption])
  return (
    <Box className={classes.pageWrapper}>
      <LeaderboardTypeModal
        open={menuOpen}
        anchorEl={anchorEl}
        handleClose={handleClose}
        options={availableOptions}
        selectOption={setSelectedOption}
      />

      {showWarningBanner && isDelayWarning && (
        <WarningBanner
          onClose={handleBannerClose}
          isHiding={isHiding}
          lastTimestamp={hexToDate(lastSnapTimestamp) ?? new Date()}
        />
      )}
      <Box className={classes.leaderBoardWrapper}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            width: '100%'
          }}>
          <YourProgress
            userStats={userStats.total}
            estimated24hPoints={estimated24hPoints}
            isLoadingList={isLoadingList}
          />
          <RewardedPools
            network={currentNetwork}
            copyAddressHandler={copyAddressHandler}
            rewardedPoolsData={promotedPoolsData}
          />
          <TopScorers top3Scorers={top3Scorers} type={type} />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            width: '100%',
            marginTop: '24px'
          }}>
          <Typography className={classes.leaderboardHeaderSectionTitle}>
            {(() => {
              switch (alignment) {
                case 'leaderboard':
                  return 'Point Leaderboard'
                case 'faq':
                  return 'Frequent questions'
                case 'claim':
                  return 'Claim'
                default:
                  return 0
              }
            })()}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              position: 'relative',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              flexWrap: 'wrap-reverse'
            }}>
            {alignment === 'leaderboard' && (
              <Box className={classes.leaderboardTypeBox}>
                <Button
                  className={classes.leaderboardTypeButton}
                  disableRipple
                  disableFocusRipple
                  onClick={handleClick}>
                  <Typography className={classes.leaderboardTypeText}>{selectedOption}</Typography>
                  <img src={icons.dropdown} alt=''></img>
                </Button>
              </Box>
            )}
            <Switcher alignment={alignment} setAlignment={setAlignment} />
          </Box>
        </Box>

        {content}
      </Box>
    </Box>
  )
}
