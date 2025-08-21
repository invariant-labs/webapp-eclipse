import { PublicKey } from '@solana/web3.js'
import { SwapToken } from '@store/selectors/solanaWallet'
import { printBN } from '@utils/utils'
import { useEffect, useState } from 'react'

export interface ProcessedToken {
  id: PublicKey
  symbol: string
  icon: string
  value: number
  isUnknown?: boolean
  decimal: number
  amount: number
}

export const useProcessedTokens = (
  prices: Record<string, number>,
  tokensList: SwapToken[],
  isBalanceLoading: boolean
) => {
  const [processedTokens, setProcessedTokens] = useState<ProcessedToken[]>([])
  const [isProcesing, setIsProcesing] = useState<boolean>(true)

  useEffect(() => {
    const processTokens = async () => {
      const nonZeroTokens = tokensList.filter(token => {
        const balance = printBN(token.balance, token.decimals)
        return parseFloat(balance) > 0
      })

      const processed = await Promise.all(
        nonZeroTokens.map(async token => {
          const balance = Number(printBN(token.balance, token.decimals).replace(',', '.'))
          const priceData = prices[token.assetAddress.toString()]

          return {
            id: token.assetAddress,
            symbol: token.symbol,
            icon: token.logoURI,
            isUnknown: token.isUnknown,
            decimal: token.decimals,
            amount: balance,
            value: balance * priceData
          }
        })
      )

      setProcessedTokens(processed)
      setIsProcesing(false)
    }
    if (isBalanceLoading) return
    if (tokensList?.length) {
      processTokens()
    }
  }, [tokensList, isBalanceLoading])

  return { processedTokens, isProcesing }
}
