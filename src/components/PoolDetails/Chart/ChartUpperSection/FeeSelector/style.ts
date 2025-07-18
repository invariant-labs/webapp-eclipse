import { colors, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(theme => ({
  wrapper: {
    position: 'relative',
    width: 180,
    cursor: 'pointer'
  },
  selected: {
    backgroundColor: '#1f1f1f',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: `1px solid #333`
  },
  selectedText: {
    fontSize: 14
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
    borderTop: '6px solid #aaa',
    marginLeft: 8
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    width: '100%',
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 999,
    overflow: 'hidden'
  },
  option: {
    padding: '10px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    color: '#fff',
    transition: 'background 0.2s ease',
    '&:hover': {
      backgroundColor: '#333'
    }
  },
  optionText: {
    fontSize: 14,
    fontWeight: 500
  },
  tvlText: {
    fontSize: 12,
    color: '#999'
  },
  active: {
    backgroundColor: '#2c2c2c'
  },
  disabled: {
    color: '#666',
    cursor: 'not-allowed',
    '&:hover': {
      backgroundColor: 'transparent'
    }
  }
}))

export default useStyles
