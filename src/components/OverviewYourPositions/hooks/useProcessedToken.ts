import { PublicKey } from '@solana/web3.js'
import { printBN, getTokenPrice } from '@utils/utils'
import { useEffect, useState } from 'react'

interface Token {
  assetAddress: PublicKey
  balance: any
  tokenProgram?: PublicKey
  symbol: string
  address: PublicKey
  decimals: number
  name: string
  logoURI: string
  coingeckoId?: string
  isUnknown?: boolean
}

interface ProcessedPool {
  id: PublicKey
  symbol: string
  icon: string
  value: number
  amount: number
}

export const useProcessedTokens = (tokensList: Token[]) => {
  const [processedPools, setProcessedPools] = useState<ProcessedPool[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const processTokens = async () => {
      setIsLoading(true)

      const nonZeroTokens = tokensList.filter(token => {
        const balance = printBN(token.balance, token.decimals)
        return parseFloat(balance) > 0
      })

      const processed = await Promise.all(
        nonZeroTokens.map(async token => {
          const balance = Number(printBN(token.balance, token.decimals).replace(',', '.'))

          let price = 0
          try {
            const priceData = await getTokenPrice(token.coingeckoId ?? '')
            price = priceData ?? 0
          } catch (error) {
            console.error(`Failed to fetch price for ${token.symbol}:`, error)
          }

          return {
            id: token.address,
            symbol: token.symbol,
            icon: token.logoURI,
            amount: balance,
            value: balance * price
          }
        })
      )

      setProcessedPools(processed)
      setIsLoading(false)
    }

    if (tokensList?.length) {
      processTokens()
    }
  }, [tokensList])

  return { processedPools, isLoading }
}
