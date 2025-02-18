import { makeStyles } from 'tss-react/mui'
import { colors } from '@static/theme'

export const useDesktopSkeletonStyles = makeStyles()(() => ({
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
  tableHead: {
    display: 'table',
    width: '100%',
    tableLayout: 'fixed',
    borderBottom: `1px solid ${colors.invariant.light}`
  },
  tableBody: {
    display: 'block',
    maxHeight: 'calc(5 * 85px)',
    overflowY: 'auto'
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
  bodyRow: {
    display: 'table',
    width: '100%',
    borderTop: `1px solid ${colors.invariant.light}`,

    height: '82.6px',
    tableLayout: 'fixed',
    '&:nth-of-type(odd)': {
      background: colors.invariant.component
    },
    '&:nth-of-type(even)': {
      background: `${colors.invariant.component}80`
    }
  },
  pairNameCell: {
    width: '25%',
    textAlign: 'left',
    padding: '14px 41px 14px 22px !important',
    border: 'none'
  },
  feeTierCell: {
    width: '12%',
    padding: '14px 20px !important',
    border: 'none'
  },
  tokenRatioCell: {
    width: '15%',
    padding: '14px 20px !important',
    border: 'none'
  },
  valueCell: {
    width: '10%',
    padding: '14px 20px !important',
    border: 'none'
  },
  feeCell: {
    width: '10%',
    padding: '14px 20px !important',
    border: 'none'
  },
  chartCell: {
    width: '16%',
    padding: '14px 20px !important',
    border: 'none'
  },
  actionCell: {
    width: '4%',
    padding: '14px 8px !important',
    border: 'none'
  },
  skeletonContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  cellBase: {
    padding: '14px 20px',
    background: 'inherit',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    borderTop: `1px solid ${colors.invariant.light}`
  },
  tableFooter: {
    borderTop: `2px solid ${colors.invariant.light}`,

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
  }
}))
