import SolanaWalletEvents from '@containers/EventsHandlers/solanaWallet'
import MarketEvents from '@containers/EventsHandlers/market'
import XInvtEvents from './xinvt'
// import SaleEvents from '@containers/EventsHandlers/sale'

const EventHandler = () => {
  return (
    <>
      <SolanaWalletEvents />
      <MarketEvents />
      <XInvtEvents />
      {/* <SaleEvents /> */}
    </>
  )
}

export default EventHandler
