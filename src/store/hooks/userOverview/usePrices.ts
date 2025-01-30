import { getTokenPrice, getMockedTokenPrice } from '@utils/utils'
import { useState, useEffect } from 'react'
import { network } from '@store/selectors/solanaConnection'
import { useSelector } from 'react-redux'
import { UnclaimedFeeItemProps } from '@components/OverviewYourPositions/components/UnclaimedFeeList/UnclaimedFeeItem/UnclaimedFeeItem'

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
    if (!data?.tokenX.assetsAddress || !data?.tokenY.assetsAddress) return

    const fetchPrices = async () => {
      getTokenPrice(data.tokenX.assetsAddress ?? '')
        .then(price => setTokenXPriceData({ price: price ?? 0, loading: false }))
        .catch(() => {
          setTokenXPriceData({
            price: getMockedTokenPrice(data.tokenX.name, networkType).price,
            loading: false
          })
        })

      getTokenPrice(data.tokenY.assetsAddress ?? '')
        .then(price => setTokenYPriceData({ price: price ?? 0, loading: false }))
        .catch(() => {
          setTokenYPriceData({
            price: getMockedTokenPrice(data.tokenY.name, networkType).price,
            loading: false
          })
        })
    }

    fetchPrices()
  }, [data?.tokenX.assetsAddress, data?.tokenY.assetsAddress, networkType])
  return { tokenXPriceData, tokenYPriceData }
}
