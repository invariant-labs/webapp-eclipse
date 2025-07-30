import { colors, theme, typography } from '@static/theme'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
  wrapper: {
    position: 'relative',
    cursor: 'pointer',
    alignSelf: 'end',
    zIndex: 15
  },
  selected: {
    color: colors.invariant.text,
    paddingBlock: 8,
    display: 'flex',
    width: 128,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${colors.invariant.light}`,
    borderRadius: 11,
    height: 24,

    [theme.breakpoints.down(1200)]: {
      paddingBlock: 6
    }
  },
  selectedText: {
    ...typography.body1,
    marginRight: 8
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
    width: 160,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: -24,
    padding: 8,
    backgroundColor: colors.invariant.component,
    borderRadius: 16,
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    zIndex: 1,
    overflow: 'hidden',

    [theme.breakpoints.down('sm')]: {
      left: -8
    }
  },
  option: {
    padding: '10px 14px',
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background 0.2s ease',
    background: colors.invariant.newDark,
    borderRadius: 11,
    '&:hover': {
      background: colors.invariant.light
    }
  },
  optionText: {
    color: colors.invariant.text,
    ...typography.caption1
  },
  tvlText: {
    color: colors.invariant.text,
    ...typography.caption4
  },
  active: {
    backgroundImage: `linear-gradient( #3A466B, #3A466B), linear-gradient(0deg, #EF84F5  , #2EE09A)`,

    '&:hover': {
      backgroundImage: `linear-gradient( #2A365C, #2A365C), linear-gradient(0deg, #EF84F5  , #2EE09A)`
    }
  },
  disabled: {
    cursor: 'not-allowed',
    background: colors.invariant.component,
    filter: 'brightness(0.85)',
    '& p': {
      color: colors.invariant.textGrey
    },

    '&:hover': {
      background: colors.invariant.component,
      filter: 'brightness(0.85)'
    }
  },
  bestSelect: {
    border: `2px solid ${colors.invariant.green}`,

    '& *': {
      color: colors.invariant.green
    }
  },
  promotedSelect: {
    color: colors.invariant.pink,
    borderRadius: 11,
    border: '2px solid transparent',
    backgroundImage: `linear-gradient(${colors.invariant.component},${colors.invariant.component}), linear-gradient(0deg, #EF84F5  , #2EE09A)`,
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    '&:hover': {
      color: colors.invariant.pink,
      backgroundImage:
        'linear-gradient(#2A365C, #2A365C),  linear-gradient(0deg, #EF84F5  , #2EE09A)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box'
    },
    '&.Mui-selected': {
      backgroundImage:
        'linear-gradient(#2A365C, #2A365C),  linear-gradient(0deg, #EF84F5  , #2EE09A)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box'
    }
  },
  promoted: {
    color: colors.invariant.pink,
    borderRadius: 10,
    border: '2px solid transparent',
    backgroundImage: `linear-gradient(${colors.invariant.newDark},${colors.invariant.newDark}),linear-gradient(0deg, #EF84F5  , #2EE09A)`,
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    '&:hover': {
      color: colors.invariant.pink,
      backgroundImage:
        'linear-gradient(#2A365C, #2A365C), linear-gradient(0deg, #EF84F5  , #2EE09A)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box'
    },
    '&.Mui-selected': {
      backgroundImage:
        'linear-gradient(#2A365C, #2A365C), linear-gradient(0deg, #EF84F5  , #2EE09A)',
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box'
    }
  },
  best: {
    color: colors.invariant.green,
    border: `2px solid ${colors.invariant.green}`,
    borderRadius: 10,
    '&:hover': {
      color: colors.invariant.green
    }
  },
  selectorDisabled: {
    cursor: 'not-allowed'
  },
  valueContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    '& > :first-of-type': {
      color: colors.invariant.textGrey
    },
    '& > :nth-of-type(2)': {
      color: colors.invariant.text
    }
  }
}))

export default useStyles
