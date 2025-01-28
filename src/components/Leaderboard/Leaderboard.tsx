import React, { useState } from 'react'
import { Box, Grid } from '@mui/material'
import useStyles from './style'
import {
  BANNER_STORAGE_KEY,
  LeaderBoardType,
  NetworkType,
  PointsPageContent
} from '@store/consts/static'
import LeaderboardTypeModal from '@components/Modals/LeaderboardTypeModal/LeaderboardTypeModal'
import { WarningBanner } from './WarningBanner/WarningBanner'
import { hexToDate } from '@utils/utils'
import { YourProgress } from './YourProgress/YourProgress'
import { ExtendedPoolStatsDataWithPoints, RewardedPools } from './RewardedPools/RewardedPools'
import { TopScorers } from './TopScorers/TopScorers'
import { Switcher } from './Switcher/Switcher'
import LeaderboardList from './LeaderboardList/LeaderboardList'
import { InfoComponent } from './InfoComponent/InfoComponent'
import { Faq } from './Faq/Faq'
import { Claim } from './Claim/Claim'
import { CurrentUser, LeaderboardUser } from '@store/reducers/leaderboard'
import { BN } from '@coral-xyz/anchor'
import { VariantType } from 'notistack'

interface LeaderboardProps {
  isDelayWarning: boolean
  lastSnapTimestamp: string
  userStats: CurrentUser
  estimated24hPoints: BN
  isLoadingList: boolean
  currentNetwork: NetworkType
  copyAddressHandler: (message: string, variant: VariantType) => void
  promotedPoolsData: ExtendedPoolStatsDataWithPoints[]
  top3Scorers: LeaderboardUser
  leaderboardType: LeaderBoardType
  selectedOption: LeaderBoardType
  setSelectedOption: React.Dispatch<React.SetStateAction<LeaderBoardType>>
  showWarningBanner: boolean
  setShowWarningBanner: React.Dispatch<React.SetStateAction<boolean>>
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  isDelayWarning,
  lastSnapTimestamp,
  userStats,
  estimated24hPoints,
  isLoadingList,
  currentNetwork,
  copyAddressHandler,
  promotedPoolsData,
  top3Scorers,
  leaderboardType,
  selectedOption,
  setSelectedOption,
  showWarningBanner,
  setShowWarningBanner
}) => {
  const { classes } = useStyles()

  const [alignment, setAlignment] = useState<PointsPageContent>(PointsPageContent.Leaderboard)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const [isHiding, setIsHiding] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const availableOptions: LeaderBoardType[] = ['Total', 'Liquidity', 'Swap']

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isMenuOpen) {
      setIsMenuOpen(false)
      return
    }
    setAnchorEl(event.currentTarget)
    setIsMenuOpen(true)
  }

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

  const content = React.useMemo(() => {
    if (alignment === PointsPageContent.Leaderboard) {
      return (
        <>
          <LeaderboardList />
          <InfoComponent />
        </>
      )
    } else if (alignment === PointsPageContent.FAQ) {
      return <Faq />
    } else if (alignment === PointsPageContent.Claim) {
      return <Claim />
    }
  }, [alignment])

  return (
    <Box className={classes.pageWrapper}>
      <LeaderboardTypeModal
        open={isMenuOpen}
        anchorEl={anchorEl}
        handleClose={() => setIsMenuOpen(false)}
        options={availableOptions}
        selectOption={setSelectedOption}
        currentOption={selectedOption}
      />
      {showWarningBanner && isDelayWarning && (
        <WarningBanner
          onClose={handleBannerClose}
          isHiding={isHiding}
          lastTimestamp={hexToDate(lastSnapTimestamp) ?? new Date()}
        />
      )}
      <Box className={classes.leaderBoardWrapper}>
        <Grid display='flex' flexDirection='column' alignItems='center' gap={3} width='100%'>
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
          <TopScorers top3Scorers={top3Scorers} type={leaderboardType} />
        </Grid>
        <Switcher
          alignment={alignment}
          setAlignment={setAlignment}
          type={leaderboardType}
          handleClick={handleOpenMenu}
          isMenuOpen={isMenuOpen}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          availableOptions={availableOptions}
        />
        {content}
      </Box>
    </Box>
  )
}
