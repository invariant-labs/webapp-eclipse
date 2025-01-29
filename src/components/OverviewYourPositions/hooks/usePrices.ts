import { getTokenPrice, getMockedTokenPrice } from '@utils/utils'
import { useState, useEffect } from 'react'
import { UnclaimedFeeItemProps } from '../components/UnclaimedFeeList/UnclaimedFeeItem/UnclaimedFeeItem'
import { network } from '@store/selectors/solanaConnection'
import { useSelector } from 'react-redux'

interface TokenPriceData {
  price: number
  loading: boolean
}

export const usePrices = ({ data }: Pick<UnclaimedFeeItemProps, 'data'>) => {
  const networkType = useSelector(network)

  const [tokenXPriceData, setTokenXPriceData] = useState<TokenPriceData>({
    price: 0,
    loading: true
  })
  const [tokenYPriceData, setTokenYPriceData] = useState<TokenPriceData>({
    price: 0,
    loading: true
  })
  useEffect(() => {
    if (!data?.tokenX.coingeckoId || !data?.tokenY.coingeckoId) return

    const fetchPrices = async () => {
      getTokenPrice(data.tokenX.coingeckoId ?? '')
        .then(price => setTokenXPriceData({ price: price ?? 0, loading: false }))
        .catch(() => {
          setTokenXPriceData({
            price: getMockedTokenPrice(data.tokenX.name, networkType).price,
            loading: false
          })
        })

      getTokenPrice(data.tokenY.coingeckoId ?? '')
        .then(price => setTokenYPriceData({ price: price ?? 0, loading: false }))
        .catch(() => {
          setTokenYPriceData({
            price: getMockedTokenPrice(data.tokenY.name, networkType).price,
            loading: false
          })
        })
    }

    fetchPrices()
  }, [data?.tokenX.coingeckoId, data?.tokenY.coingeckoId, networkType])
  return { tokenXPriceData, tokenYPriceData }
}
