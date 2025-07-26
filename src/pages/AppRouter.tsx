import { useSelector } from 'react-redux'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider
} from 'react-router-dom'
import { NetworkType } from '@store/consts/static'
import { network } from '@store/selectors/solanaConnection'
import LeaderBoardPage from './LeaderboardPage/LeaderboardPage'
import ListPage from './ListPage/ListPage'
import NewPositionPage from './NewPositionPage/NewPositionPage'
import PortfolioPage from './PortfolioPage/PortfolioPage'
import RootPage from './RootPage'
import SinglePositionPage from './SinglePositionPage/SinglePositionPage'
import TokenCreatorPage from './TokenCreatorPage/TokenCreatorPage'
import StatsPage from './StatsPage/StatsPage'
import SwapPage from './SwapPage/SwapPage'
import { ROUTES } from '@utils/utils'
import StakePage from './StakePage/StakePage'
import { PreSalePage } from './PreSalePage/PreSalePage'
import PoolDetailsPage from './PoolDetailsPage/PoolDetailsPage'

const createRouter = (currentNetwork: NetworkType) =>
  createBrowserRouter(
    createRoutesFromElements(
      <Route path={ROUTES.ROOT} element={<RootPage />}>
        <Route path={ROUTES.EXCHANGE_WITH_PARAMS} element={<SwapPage />} />
        <Route path={ROUTES.LIQUIDITY} element={<ListPage />} />
        <Route path={ROUTES.STATISTICS} element={<StatsPage />} />
        <Route path={ROUTES.NEW_POSITION_WITH_PARAMS} element={<NewPositionPage />} />
        <Route path={ROUTES.POSITION_WITH_ID} element={<SinglePositionPage />} />
        <Route path={ROUTES.STAKE} element={<StakePage />} />
        <Route path={ROUTES.SALE} element={<PreSalePage />} />
        <Route path={ROUTES.PORTFOLIO} element={<PortfolioPage />} />
        <Route path={ROUTES.POOL_DETAILS_WITH_PARAMS} element={<PoolDetailsPage />} />
        {currentNetwork === NetworkType.Testnet && (
          <Route path={ROUTES.CREATOR} element={<TokenCreatorPage />} />
        )}
        {currentNetwork === NetworkType.Mainnet && (
          <Route path={ROUTES.POINTS} element={<LeaderBoardPage />} />
        )}
        <Route path='*' element={<Navigate to={ROUTES.EXCHANGE} replace />} />
      </Route>
    )
  )

export const AppRouter = () => {
  const currentNetwork = useSelector(network)
  const router = createRouter(currentNetwork)

  return <RouterProvider router={router} />
}
