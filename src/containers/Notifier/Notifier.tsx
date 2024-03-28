import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import icons from '@static/icons'
import { useSnackbar } from 'notistack'
import { actions } from '@reducers/snackbars'
import { snackbars } from '@selectors/snackbars'
import { network } from '@selectors/solanaConnection'
import useStyles from './style'
import { getExplorer } from '@consts/utils'
import { NetworkType } from '@consts/static'

let displayed: string[] = []

const Notifier = () => {
  const dispatch = useDispatch()
  const notifications = useSelector(snackbars)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const classes = useStyles()

  const storeDisplayed = (id: string) => {
    displayed = [...displayed, id]
  }

  const removeDisplayed = (id: string) => {
    displayed = [...displayed.filter(key => id !== key)]
  }
  const currentNetwork = useSelector(network)

  React.useEffect(() => {
    notifications.forEach(
      ({ key = '', message, open, variant, txid, isAccount, persist = true }) => {
        if (!open) {
          // dismiss snackbar using notistack
          closeSnackbar(key)
          return
        }
        // do nothing if snackbar is already displayed
        if (key && displayed.includes(key)) return
        const action = () =>
          txid && (
            <div className={classes.detailsWrapper}>
              <button
                className={classes.button}
                onClick={() => {
                  const sufix =
                    currentNetwork === NetworkType.DEVNET ? '?cluster=devnet' : '?cluster=testnet'
                  if (txid !== undefined && !isAccount) {
                    window.open(getExplorer(currentNetwork) + 'tx/' + txid + sufix)
                  } else if (isAccount) {
                    window.open(getExplorer(currentNetwork) + 'address/' + txid + sufix)
                  }
                }}>
                <span>Details</span>
              </button>
              <button className={classes.closeButton} onClick={() => closeSnackbar(key)}>
                <img src={icons.closeIcon}></img>
              </button>
            </div>
          )

        // display snackbar using notistack
        enqueueSnackbar(message, {
          key,
          action: action,
          variant: variant,
          persist: persist,
          // autoHideDuration: 5000,
          onExited: (_event, myKey) => {
            dispatch(actions.remove(myKey as string))
            removeDisplayed(myKey as string)
          }
        })
        storeDisplayed(key)
      }
    )
  }, [notifications, closeSnackbar, enqueueSnackbar, dispatch])

  return null
}

export default Notifier
