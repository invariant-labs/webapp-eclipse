import { Provider } from 'react-redux'
import { store } from './store'
import { RouterProvider } from 'react-router-dom'
import { theme } from '@static/theme'
import { ThemeProvider } from '@mui/material/styles'
import { filterConsoleMessages, messagesToHide } from './hideErrors'
import { SnackbarProvider } from 'notistack'
import Notifier from '@containers/Notifier/Notifier'
import { router } from '@pages/RouterPages'

filterConsoleMessages(messagesToHide)

function App() {
  return (
    <>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={99}>
            <>
              <Notifier />
              <RouterProvider router={router} />
            </>
          </SnackbarProvider>
        </ThemeProvider>
      </Provider>
    </>
  )
}

export default App
