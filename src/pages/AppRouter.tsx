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

const createRouter = (currentNetwork: NetworkType) =>
  createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootPage />}>
        <Route path='/exchange/:item1?/:item2?' element={<SwapPage />} />
        <Route path='/liquidity' element={<ListPage />} />
        <Route path='/statistics' element={<StatsPage />} />
        <Route path='/newPosition/:item1?/:item2?/:item3?' element={<NewPositionPage />} />
        <Route path='/position/:id' element={<SinglePositionPage />} />
        <Route path='/portfolio' element={<PortfolioPage />} />
        {currentNetwork === NetworkType.Testnet && (
          <Route path='/creator' element={<TokenCreatorPage />} />
        )}
        {currentNetwork === NetworkType.Mainnet && (
          <Route path='/points' element={<LeaderBoardPage />} />
        )}
        <Route path='*' element={<Navigate to='/exchange' replace />} />
      </Route>
    )
  )

export const AppRouter = () => {
  const currentNetwork = useSelector(network)
  const router = createRouter(currentNetwork)

  return <RouterProvider router={router} />
}
