import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { network } from '@store/selectors/solanaConnection'
import { balance, status } from '@store/selectors/solanaWallet'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import { actions } from '@store/reducers/creator'
import { creatorState } from '@store/selectors/creator'
import { TokenCreator } from '@components/TokenCreator/TokenCreator'
import { validateDecimals, validateSupply } from '@utils/tokenCreatorUtils'
import { FormData } from '@store/consts/tokenCreator/types'
import { ensureError } from '@utils/utils'

export const TokenCreatorWrapper: React.FC = () => {
  const currentNetwork = useSelector(network)
  const walletStatus = useSelector(status)
  const ethBalance = useSelector(balance)
  const { success, inProgress } = useSelector(creatorState)

  const dispatch = useDispatch()

  const buttonText = useMemo(
    () => (walletStatus === Status.Initialized ? 'Create token' : 'Connect wallet'),
    [walletStatus]
  )

  const onSubmit = (data: FormData) => {
    try {
      const decimalsError = validateDecimals(data.decimals)
      if (decimalsError) {
        throw new Error(decimalsError)
      }

      const supplyError = validateSupply(data.supply, data.decimals)
      if (supplyError) {
        throw new Error(supplyError)
      }

      dispatch(actions.createToken({ data, network: currentNetwork }))
    } catch (e: unknown) {
      const error = ensureError(e)
      console.error('Error submitting form:', error)
    }
  }

  return (
    <TokenCreator
      buttonText={buttonText}
      currentNetwork={currentNetwork}
      ethBalance={ethBalance}
      inProgress={inProgress}
      onConnectWallet={() => dispatch(walletActions.connect(false))}
      onSubmit={onSubmit}
      success={success}
    />
  )
}
