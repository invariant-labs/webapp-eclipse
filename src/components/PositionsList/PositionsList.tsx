import { INoConnected, NoConnected } from '@components/NoConnected/NoConnected'
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  InputBase,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery
} from '@mui/material'
import SearchIcon from '@static/svg/lupaDark.svg'
import refreshIcon from '@static/svg/refresh.svg'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStyles } from './style'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import { useDispatch } from 'react-redux'
import { actions } from '@store/reducers/leaderboard'
import { PositionItemMobile } from './PositionItem/variants/PositionItemMobile'
import { IPositionItem } from './types'
import { blurContent, unblurContent } from '@utils/uiUtils'
import PositionCardsSkeletonMobile from './PositionItem/variants/PositionTables/skeletons/PositionCardsSkeletonMobile'
import { PositionTableSkeleton } from './PositionItem/variants/PositionTables/skeletons/PositionTableSkeleton'
import { PositionsTable } from './PositionItem/variants/PositionTables/PositionsTable'
import { EmptyPlaceholder } from '@components/EmptyPlaceholder/EmptyPlaceholder'

export enum LiquidityPools {
  Standard = 'Standard',
  Locked = 'Locked'
}

interface IProps {
  initialPage: number
  setLastPage: (page: number) => void
  data: IPositionItem[]
  onAddPositionClick: () => void
  loading?: boolean
  showNoConnected?: boolean
  noConnectedBlockerProps: INoConnected
  itemsPerPage: number
  searchValue: string
  searchSetValue: (value: string) => void
  handleRefresh: () => void
  length: number
  lockedLength: number
  noInitialPositions: boolean
  lockedData: IPositionItem[]
}

export const PositionsList: React.FC<IProps> = ({
  data,
  onAddPositionClick,
  loading = false,
  showNoConnected = false,
  noConnectedBlockerProps,
  searchValue,
  searchSetValue,
  handleRefresh,
  // pageChanged,
  length,
  lockedLength,
  // loadedPages,
  // getRemainingPositions,
  noInitialPositions,
  lockedData
}) => {
  const { classes } = useStyles()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [alignment, setAlignment] = useState<string>(LiquidityPools.Standard)
  const isLg = useMediaQuery('@media (max-width: 1360px)')

  const currentData = useMemo(() => {
    if (alignment === LiquidityPools.Standard) {
      return data
    }
    return lockedData
  }, [alignment, data, lockedData])

  const currentLength = useMemo(() => {
    if (alignment === LiquidityPools.Standard) {
      return length
    }
    return lockedLength
  }, [alignment, length, lockedLength])

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // if (Object.keys(loadedPages).length * POSITIONS_PER_QUERY < Number(length)) {
    //   getRemainingPositions()
    // }

    searchSetValue(e.target.value.toLowerCase())
  }

  const handleSwitchPools = (
    _: React.MouseEvent<HTMLElement>,
    newAlignment: LiquidityPools | null
  ) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment)
    }
  }

  useEffect(() => {
    dispatch(actions.getLeaderboardConfig())
  }, [dispatch])

  const [isLockPositionModalOpen, setIsLockPositionModalOpen] = useState(false)

  useEffect(() => {
    if (isLockPositionModalOpen) {
      blurContent()
    } else {
      unblurContent()
    }
  }, [isLockPositionModalOpen])

  const [allowPropagation, setAllowPropagation] = useState(true)

  return (
    <Grid container direction='column' className={classes.root}>
      <Grid
        className={classes.header}
        container
        direction='row'
        justifyContent='space-between'
        alignItems='center'>
        <Grid className={classes.searchRoot}>
          <Grid className={classes.titleBar}>
            <Typography className={classes.title}>Your Positions</Typography>
            <TooltipHover text='Total number of your positions'>
              <Typography className={classes.positionsNumber}>{String(currentLength)}</Typography>
            </TooltipHover>
          </Grid>
          <Grid className={classes.searchWrapper}>
            <Grid className={classes.filtersContainer}>
              <InputBase
                type={'text'}
                className={classes.searchBar}
                placeholder='Search position'
                endAdornment={
                  <InputAdornment position='end'>
                    <img src={SearchIcon} className={classes.searchIcon} alt='Search' />
                  </InputAdornment>
                }
                onChange={handleChangeInput}
                value={searchValue}
                disabled={noInitialPositions}
              />
              <Box className={classes.switchPoolsContainer}>
                <Box
                  className={classes.switchPoolsMarker}
                  sx={{
                    left: alignment === LiquidityPools.Standard ? 0 : '50%'
                  }}
                />
                <ToggleButtonGroup
                  value={alignment}
                  exclusive
                  onChange={handleSwitchPools}
                  className={classes.switchPoolsButtonsGroup}>
                  <ToggleButton
                    value={LiquidityPools.Standard}
                    disableRipple
                    className={classes.switchPoolsButton}
                    style={{ fontWeight: alignment === LiquidityPools.Standard ? 700 : 400 }}>
                    Standard
                  </ToggleButton>
                  <ToggleButton
                    disabled={lockedData.length === 0}
                    value={LiquidityPools.Locked}
                    disableRipple
                    className={classes.switchPoolsButton}
                    classes={{ disabled: classes.disabledSwitchButton }}
                    style={{ fontWeight: alignment === LiquidityPools.Locked ? 700 : 400 }}>
                    Locked
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Grid>
            <Grid
              display='flex'
              columnGap={2}
              justifyContent='space-between'
              className={classes.fullWidthWrapper}>
              <TooltipHover text='Refresh'>
                <Grid display='flex' alignItems='center'>
                  <Button
                    disabled={showNoConnected}
                    onClick={showNoConnected ? () => {} : handleRefresh}
                    className={classes.refreshIconBtn}>
                    <img src={refreshIcon} className={classes.refreshIcon} alt='Refresh' />
                  </Button>
                </Grid>
              </TooltipHover>
              <Button className={classes.button} variant='contained' onClick={onAddPositionClick}>
                <span className={classes.buttonText}>+ Add Position</span>
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid container direction='column' className={classes.list} justifyContent='flex-start'>
        {loading ? (
          !isLg ? (
            <PositionTableSkeleton />
          ) : (
            <PositionCardsSkeletonMobile />
          )
        ) : showNoConnected ? (
          <NoConnected {...noConnectedBlockerProps} />
        ) : !isLg ? (
          <PositionsTable
            positions={currentData}
            isLockPositionModalOpen={isLockPositionModalOpen}
            setIsLockPositionModalOpen={setIsLockPositionModalOpen}
            noInitialPositions={noInitialPositions}
            onAddPositionClick={onAddPositionClick}
          />
        ) : currentData.length === 0 ? (
          <EmptyPlaceholder
            newVersion
            desc={
              noInitialPositions
                ? 'Add your first position by pressing the button and start earning!'
                : 'Did not find any matching positions'
            }
            onAction={onAddPositionClick}
            withButton={noInitialPositions}
          />
        ) : (
          currentData.map((element, index) => (
            <Grid
              onClick={() => {
                if (allowPropagation) {
                  navigate(`/position/${element.id}`)
                }
              }}
              key={element.id}
              className={classes.itemLink}>
              <PositionItemMobile
                key={index}
                {...element}
                isLockPositionModalOpen={isLockPositionModalOpen}
                setIsLockPositionModalOpen={setIsLockPositionModalOpen}
                setAllowPropagation={setAllowPropagation}
              />
            </Grid>
          ))
        )}
      </Grid>
    </Grid>
  )
}
