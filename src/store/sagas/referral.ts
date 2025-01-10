import { PayloadAction } from '@reduxjs/toolkit'
import { actions } from '@store/reducers/referral'
import { all, call, put, spawn, takeEvery } from 'typed-redux-saga'
import { handleRpcError } from './connection'

async function fetchRefferalCode(address: string) {
  const response = await fetch(`http://localhost:3000/api/leaderboard/get-code/${address}`)
  if (!response.ok) {
    throw new Error('Failed to fetch referral code')
  }
  return response.json() as Promise<string>
}
async function useReferralCode(code: string) {
  const response = await fetch(`https://points.invariant.app/api/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ code })
  })

  if (!response.ok) {
    throw new Error('Failed to use code')
  }

  return response
}
export function* getCode(action: PayloadAction<{ address: string }>): Generator {
  try {
    const code = yield* call(fetchRefferalCode, action.payload.address)

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
    yield* call(useReferralCode, action.payload.code)

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

export function* leaderboardSaga(): Generator {
  yield all([getCodeHandler, useCodeHandler].map(spawn))
}
