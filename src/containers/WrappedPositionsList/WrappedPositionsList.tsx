import { PositionsList } from '@components/PositionsList/PositionsList'
import { NetworkType, POSITIONS_PER_PAGE } from '@store/consts/static'
import { calculatePriceSqrt } from '@invariant-labs/sdk-eclipse'
import { getX, getY } from '@invariant-labs/sdk-eclipse/lib/math'
import { DECIMAL, getMaxTick, getMinTick } from '@invariant-labs/sdk-eclipse/lib/utils'
import { actions } from '@store/reducers/positions'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import {
  isLoadingPositionsList,
  lastPageSelector,
  lockedPositionsWithPoolsData,
  positionsWithPoolsData
} from '@store/selectors/positions'
import { address, status } from '@store/selectors/solanaWallet'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { calcYPerXPriceBySqrtPrice, printBN } from '@utils/utils'
import { IPositionItem } from '@components/PositionsList/types'

export const WrappedPositionsList: React.FC = () => {
  const walletAddress = useSelector(address)
  const list = useSelector(positionsWithPoolsData)
  const lockedList = useSelector(lockedPositionsWithPoolsData)
  const isLoading = useSelector(isLoadingPositionsList)
  const lastPage = useSelector(lastPageSelector)
  const walletStatus = useSelector(status)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [value, setValue] = useState<string>('')

  const handleSearchValue = (value: string) => {
    setValue(value)
  }

  const setLastPage = (page: number) => {
    dispatch(actions.setLastPage(page))
  }

  useEffect(() => {
    if (list.length === 0) {
      setLastPage(1)
    }

    if (lastPage > Math.ceil(list.length / POSITIONS_PER_PAGE)) {
      setLastPage(lastPage === 1 ? 1 : lastPage - 1)
    }
  }, [list])

  const handleRefresh = () => {
    dispatch(actions.getPositionsList())
  }

  const data: IPositionItem[] = list
    .map(position => {
      const lowerPrice = calcYPerXPriceBySqrtPrice(
        calculatePriceSqrt(position.lowerTickIndex),
        position.tokenX.decimals,
        position.tokenY.decimals
      )
      const upperPrice = calcYPerXPriceBySqrtPrice(
        calculatePriceSqrt(position.upperTickIndex),
        position.tokenX.decimals,
        position.tokenY.decimals
      )

      const minTick = getMinTick(position.poolData.tickSpacing)
      const maxTick = getMaxTick(position.poolData.tickSpacing)

      const min = Math.min(lowerPrice, upperPrice)
      const max = Math.max(lowerPrice, upperPrice)

      let tokenXLiq, tokenYLiq

      try {
        tokenXLiq = +printBN(
          getX(
            position.liquidity,
            calculatePriceSqrt(position.upperTickIndex),
            position.poolData.sqrtPrice,
            calculatePriceSqrt(position.lowerTickIndex)
          ),
          position.tokenX.decimals
        )
      } catch (error) {
        tokenXLiq = 0
      }

      try {
        tokenYLiq = +printBN(
          getY(
            position.liquidity,
            calculatePriceSqrt(position.upperTickIndex),
            position.poolData.sqrtPrice,
            calculatePriceSqrt(position.lowerTickIndex)
          ),
          position.tokenY.decimals
        )
      } catch (error) {
        tokenYLiq = 0
      }

      const currentPrice = calcYPerXPriceBySqrtPrice(
        position.poolData.sqrtPrice,
        position.tokenX.decimals,
        position.tokenY.decimals
      )

      const valueX = tokenXLiq + tokenYLiq / currentPrice
      const valueY = tokenYLiq + tokenXLiq * currentPrice

      return {
        tokenXName: position.tokenX.symbol,
        tokenYName: position.tokenY.symbol,
        tokenXIcon: position.tokenX.logoURI,
        tokenYIcon: position.tokenY.logoURI,
        poolAddress: position.poolData.address,
        liquidity: position.liquidity,
        poolData: position.poolData,
        fee: +printBN(position.poolData.fee, DECIMAL - 2),
        min,
        max,
        position,
        valueX,
        valueY,
        address: walletAddress.toString(),
        id: position.id.toString() + '_' + position.pool.toString(),
        isActive: currentPrice >= min && currentPrice <= max,
        currentPrice,
        tokenXLiq,
        tokenYLiq,
        network: NetworkType.Testnet,
        isFullRange: position.lowerTickIndex === minTick && position.upperTickIndex === maxTick,
        isLocked: position.isLocked
      }
    })
    .filter(item => {
      return (
        item.tokenXName.toLowerCase().includes(value.toLowerCase()) ||
        item.tokenYName.toLowerCase().includes(value.toLowerCase())
      )
    })

  const lockedData: IPositionItem[] = lockedList
    .map(position => {
      const lowerPrice = calcYPerXPriceBySqrtPrice(
        calculatePriceSqrt(position.lowerTickIndex),
        position.tokenX.decimals,
        position.tokenY.decimals
      )
      const upperPrice = calcYPerXPriceBySqrtPrice(
        calculatePriceSqrt(position.upperTickIndex),
        position.tokenX.decimals,
        position.tokenY.decimals
      )

      const minTick = getMinTick(position.poolData.tickSpacing)
      const maxTick = getMaxTick(position.poolData.tickSpacing)

      const min = Math.min(lowerPrice, upperPrice)
      const max = Math.max(lowerPrice, upperPrice)

      let tokenXLiq, tokenYLiq

      try {
        tokenXLiq = +printBN(
          getX(
            position.liquidity,
            calculatePriceSqrt(position.upperTickIndex),
            position.poolData.sqrtPrice,
            calculatePriceSqrt(position.lowerTickIndex)
          ),
          position.tokenX.decimals
        )
      } catch (error) {
        tokenXLiq = 0
      }

      try {
        tokenYLiq = +printBN(
          getY(
            position.liquidity,
            calculatePriceSqrt(position.upperTickIndex),
            position.poolData.sqrtPrice,
            calculatePriceSqrt(position.lowerTickIndex)
          ),
          position.tokenY.decimals
        )
      } catch (error) {
        tokenYLiq = 0
      }

      const currentPrice = calcYPerXPriceBySqrtPrice(
        position.poolData.sqrtPrice,
        position.tokenX.decimals,
        position.tokenY.decimals
      )

      const valueX = tokenXLiq + tokenYLiq / currentPrice
      const valueY = tokenYLiq + tokenXLiq * currentPrice

      return {
        tokenXName: position.tokenX.symbol,
        tokenYName: position.tokenY.symbol,
        tokenXIcon: position.tokenX.logoURI,
        tokenYIcon: position.tokenY.logoURI,
        fee: +printBN(position.poolData.fee, DECIMAL - 2),
        min,
        max,
        valueX,
        position,
        valueY,
        poolAddress: position.poolData.address,
        liquidity: position.liquidity,
        poolData: position.poolData,
        address: walletAddress.toString(),
        id: position.id.toString() + '_' + position.pool.toString(),
        isActive: currentPrice >= min && currentPrice <= max,
        currentPrice,
        tokenXLiq,
        tokenYLiq,
        network: NetworkType.Testnet,
        isFullRange: position.lowerTickIndex === minTick && position.upperTickIndex === maxTick,
        isLocked: position.isLocked
      }
    })
    .filter(item => {
      return (
        item.tokenXName.toLowerCase().includes(value.toLowerCase()) ||
        item.tokenYName.toLowerCase().includes(value.toLowerCase())
      )
    })
  // useEffect(() => {
  //   if (walletStatus === Status.Initialized && walletAddress && !loadedPages[0] && !length) {
  //     dispatch(actions.getPositionsListPage({ index: 0, refresh: false }))
  //   }
  // }, [walletStatus, loadedPages])

  return (
    <PositionsList
      initialPage={lastPage}
      setLastPage={setLastPage}
      searchValue={value}
      searchSetValue={handleSearchValue}
      handleRefresh={handleRefresh}
      onAddPositionClick={() => {
        navigate('/newPosition')
      }}
      data={data}
      lockedData={lockedData}
      loading={isLoading}
      showNoConnected={walletStatus !== Status.Initialized}
      itemsPerPage={POSITIONS_PER_PAGE}
      noConnectedBlockerProps={{
        onConnect: () => {
          dispatch(walletActions.connect(false))
        },
        title: 'Start exploring liquidity pools right now!',
        descCustomText: 'Or, connect your wallet to see existing positions, and create a new one!'
      }}
      // pageChanged={page => {
      //   const index = positionListPageToQueryPage(page)

      //   if (walletStatus === Status.Initialized && walletAddress && !loadedPages[index] && length) {
      //     dispatch(
      //       actions.getPositionsListPage({
      //         index,
      //         refresh: false
      //       })
      //     )
      //   }
      // }}
      // loadedPages={loadedPages}
      // getRemainingPositions={() => {
      //   dispatch(actions.getRemainingPositions({ setLoaded: true }))
      // }}
      length={list.length}
      lockedLength={lockedList.length}
      noInitialPositions={list.length === 0 && lockedList.length === 0}
    />
  )
}

export default WrappedPositionsList
