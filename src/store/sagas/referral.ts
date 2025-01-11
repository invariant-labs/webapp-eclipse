import { PayloadAction } from '@reduxjs/toolkit'
import { actions } from '@store/reducers/referral'
import { all, call, put, spawn, takeEvery } from 'typed-redux-saga'
import { handleRpcError } from './connection'
import { getWallet } from './wallet'

async function fetchRefferalCode(address: string) {
  const response = await fetch(`http://localhost:3000/api/referral/get-code/${address}`)
  if (!response.ok) {
    throw new Error('Failed to fetch referral code')
  }
  return response.json() as Promise<string>
}
async function useReferralCode(code: string, address: string, signature: string) {
  const response = await fetch(`http://localhost:3000/api/referral/use-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ address, code, signature })
  })

  if (!response.ok) {
    throw new Error('Failed to use code')
  }

  return response
}
export function* getCode(): Generator {
  try {
    const wallet = yield* call(getWallet)
    const code = yield* call(fetchRefferalCode, wallet.publicKey.toString())
    console.log(code)
    yield* put(actions.setUserCode({ code }))
    yield* put(actions.setProceedingState(false))
  } catch (error) {
    yield* put(actions.setProceedingState(false))
    console.log(error)
    yield* call(handleRpcError, (error as Error).message)
  }
}

export function* useCode(action: PayloadAction<{ code: string }>): Generator {
  try {
    const wallet = yield* call(getWallet)
    const encoder = new TextEncoder()
    const message = encoder.encode('Sign message below').buffer
    const sig = yield* call(wallet.signMessage, message)
    yield* call(useReferralCode, action.payload.code, wallet.publicKey.toString(), sig.toString())

    yield* put(
      actions.setCodeUsed({
        codeUsed: action.payload.code
      })
    )
    yield* put(actions.setProceedingState(false))
    yield* put(actions.setSuccessState(true))
  } catch (error) {
    yield* put(actions.setProceedingState(false))
    console.log(error)
  }
}

export function* getCodeHandler(): Generator {
  yield* takeEvery(actions.getUserCode, getCode)
}

export function* useCodeHandler(): Generator {
  yield* takeEvery(actions.useCode, useCode)
}

export function* referralSaga(): Generator {
  yield all([getCodeHandler, useCodeHandler].map(spawn))
}
