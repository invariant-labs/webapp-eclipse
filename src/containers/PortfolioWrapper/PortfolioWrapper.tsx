import { UserOverview } from '@components/OverviewYourPositions/UserOverview'
import WrappedPositionsList from '@containers/WrappedPositionsList/WrappedPositionsList'
import React from 'react'

const PortfolioWrapper = () => {
  return (
    <>
      <UserOverview />
      <WrappedPositionsList />
    </>
  )
}

export default PortfolioWrapper
