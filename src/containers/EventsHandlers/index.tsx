import SolanaWalletEvents from '@containers/EventsHandlers/solanaWallet'
import MarketEvents from '@containers/EventsHandlers/market'
import SaleEvents from '@containers/EventsHandlers/sale'

const EventHandler = () => {
  return (
    <>
      <SolanaWalletEvents />
      <MarketEvents />
      <SaleEvents />
    </>
  )
}

export default EventHandler
