import { pointsQMarkIcon } from '@static/icons'
interface Props {
  height: string
  marginLeft?: string
  marginTop?: string | number
}
export const QuestionMark = ({ height, marginLeft, marginTop = 0 }: Props) => {
  return (
    <img
      src={pointsQMarkIcon}
      style={{ marginLeft: marginLeft || '15%', height: `${height}`, marginTop: marginTop }}
      alt='Points Question Mark'
    />
  )
}
