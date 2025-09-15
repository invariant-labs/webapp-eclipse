import { styled } from '@mui/material/styles'

interface TokenArcProps {
  color: string
  size?: number
  stroke?: number
}

const BitzArc = styled('div', {
  shouldForwardProp: prop => prop !== 'color' && prop !== 'size' && prop !== 'stroke'
})<TokenArcProps>(({ color, size = 56, stroke = 12 }) => ({
  width: size / 2,
  height: size,
  borderLeft: 'none',
  borderTop: `${stroke}px solid ${color}`,
  borderRight: `${stroke}px solid ${color}`,
  borderBottom: `${stroke}px solid ${color}`,
  borderRadius: `0 ${size}px ${size}px 0`,
  background: 'transparent',
  flexShrink: 0,
  filter: `drop-shadow(0 0 6px ${color}60)`
}))

export default BitzArc
