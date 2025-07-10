import { pointsQMarkIcon } from '@static/icons'
interface Props {
  height: string
  marginLeft?: string
}
export const QuestionMark = ({ height, marginLeft }: Props) => {
  return (
    <img
      src={pointsQMarkIcon}
      style={{ marginLeft: marginLeft || '15%', height: `${height}` }}
      alt='Points Question Mark'
    />
  )
}
