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
    width: 132,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: -8,
    padding: 8,
    backgroundColor: colors.invariant.component,
    borderRadius: 16,
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    zIndex: 1,
    overflow: 'hidden'
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
    color: colors.invariant.textGrey,
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
    filter: 'brightness(1.2)',
    '& p': {
      color: colors.invariant.textGrey
    },

    '&:hover': {
      background: colors.invariant.componentBcg,
      filter: 'brightness(1.2)'
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
  }
}))

export default useStyles
