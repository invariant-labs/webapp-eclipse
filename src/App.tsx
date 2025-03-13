import { Provider } from 'react-redux'
import { store } from './store'
import SnackbarProvider from '@common/Snackbar'
import { theme } from '@static/theme'
import { ThemeProvider } from '@mui/material/styles'
import Notifier from '@containers/Notifier/Notifier'
import { AppRouter } from '@pages/AppRouter'
// import { filterConsoleMessages, messagesToHide } from './hideErrors'

// filterConsoleMessages(messagesToHide)

function App() {
  return (
    <>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={99}>
            <>
              <Notifier />
              <AppRouter />
            </>
          </SnackbarProvider>
        </ThemeProvider>
      </Provider>
    </>
  )
}

export default App
