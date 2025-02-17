import { Theme } from '@mui/material'
import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const usePositionTableStyle = makeStyles()((_theme: Theme) => ({
  tableContainer: {
    width: 'fit-content',
    background: 'transparent',
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column'
  },
  table: {
    borderCollapse: 'separate',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  cellBase: {
    padding: '14px 20px',
    background: 'inherit',
    border: 'none',
    borderTop: `2px solid ${colors.invariant.light}`,

    whiteSpace: 'nowrap',
    textAlign: 'center'
  },
  headerRow: {
    height: '50px',
    background: colors.invariant.component,
    '& th:first-of-type': {
      borderTopLeftRadius: '24px'
    },
    '& th:last-child': {
      borderTopRightRadius: '24px'
    }
  },
  headerCell: {
    fontSize: '16px',
    lineHeight: '24px',
    borderBottom: `1px solid ${colors.invariant.light}`,

    color: colors.invariant.textGrey,
    fontWeight: 400,
    textAlign: 'left'
  },

  pairNameCell: {
    width: '25%',
    textAlign: 'left',
    padding: '14px 41px 14px 22px !important'
  },
  pointsCell: {
    width: '8%',
    '& > div': {
      justifyContent: 'center'
    }
  },
  feeTierCell: {
    width: '12%',
    '& > div': {
      justifyContent: 'center'
    }
  },
  tokenRatioCell: {
    width: '15%',
    '& > div': {
      margin: '0 auto'
    }
  },
  valueCell: {
    width: '10%',
    '& .MuiGrid-root': {
      justifyContent: 'center'
    }
  },
  feeCell: {
    width: '10%',
    '& .MuiGrid-root': {
      justifyContent: 'center'
    }
  },
  chartCell: {
    width: '16%',
    '& > div': {
      margin: '0 auto'
    }
  },
  actionCell: {
    width: '4%',
    padding: '14px 8px',
    '& > button': {
      margin: '0 auto'
    }
  },
  tableHead: {
    display: 'table',
    width: '100%',
    tableLayout: 'fixed'
  },
  tableBody: {
    display: 'block',
    height: 'calc(4 * (20px + 82px))',
    overflowY: 'auto',

    '&::-webkit-scrollbar': {
      width: '4px'
    },

    '&::-webkit-scrollbar-thumb': {
      background: colors.invariant.pink,
      borderRadius: '4px'
    },

    '& > tr:nth-of-type(even)': {
      background: colors.invariant.component,
      '&:hover': {
        background: `${colors.invariant.component}B0`,
        cursor: 'pointer'
      }
    },
    '& > tr:nth-of-type(odd)': {
      background: `${colors.invariant.componentDark}F0`,
      '&:hover': {
        background: `${colors.invariant.componentDark}90 !important`,
        cursor: 'pointer'
      }
    },
    '& > tr': {
      background: 'transparent',
      '& td': {
        borderBottom: `1px solid ${colors.invariant.light}`
      }
    },
    '& > tr:first-of-type td': {
      borderTop: `1px solid ${colors.invariant.light}`
    }
  },
  tableBodyRow: {
    display: 'table',
    width: '100%',
    tableLayout: 'fixed'
  },
  tableFooter: {
    display: 'table',
    width: '100%',
    tableLayout: 'fixed'
  },
  footerRow: {
    background: colors.invariant.component,
    height: '50px',
    '& td:first-of-type': {
      borderBottomLeftRadius: '24px'
    },
    '& td:last-child': {
      borderBottomRightRadius: '24px'
    }
  },

  emptyContainer: {
    border: 'none',
    height: '410px',
    padding: 0,
    width: '100%'
  },
  emptyWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '90%',
    width: '100%'
  }
}))
