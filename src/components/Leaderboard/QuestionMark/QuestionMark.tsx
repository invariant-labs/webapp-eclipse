import { pointsQMarkIcon } from '@static/icons'
interface Props {
  height: string
}
export const QuestionMark = ({ height }: Props) => {
  return (
    <img
      src={pointsQMarkIcon}
      style={{ marginLeft: '15%', height: `${height}` }}
      alt='Points Question Mark'
    />
  )
}
