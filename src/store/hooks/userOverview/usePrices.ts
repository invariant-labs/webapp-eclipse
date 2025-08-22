import { getTokenPrice, getMockedTokenPrice } from '@utils/utils'
import { useState, useEffect } from 'react'
import { network } from '@store/selectors/solanaConnection'
import { useSelector } from 'react-redux'

interface TokenPriceData {
  price: number
  loading: boolean
}

export const usePrices = ({
  tokenX,
  tokenY
}: {
  tokenY: { assetsAddress?: string; name?: string }
  tokenX: { assetsAddress?: string; name?: string }
}) => {
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
    if (!tokenX || !tokenY) return

    const fetchPrices = async () => {
      getTokenPrice(networkType, tokenX.assetsAddress ?? '')
        .then(price => {
          setTokenXPriceData({ price: price ?? 0, loading: false })
        })
        .catch(() => {
          setTokenXPriceData({
            price: getMockedTokenPrice(tokenX.name ?? '', networkType).price,
            loading: false
          })
        })

      getTokenPrice(networkType, tokenY.assetsAddress ?? '')
        .then(price => setTokenYPriceData({ price: price ?? 0, loading: false }))
        .catch(() => {
          setTokenYPriceData({
            price: getMockedTokenPrice(tokenY.name ?? '', networkType).price,
            loading: false
          })
        })
    }

    fetchPrices()
  }, [tokenX.assetsAddress, tokenY.assetsAddress, networkType])
  return { tokenXPriceData, tokenYPriceData }
}
