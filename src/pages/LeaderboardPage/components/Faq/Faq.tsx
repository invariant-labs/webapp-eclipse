import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useStyles } from './styles'
import { colors } from '@static/theme'

const faqData = [
  {
    question: 'Lorem ipsum 1',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In risus ex, consectetur eu accumsan efficitur, porta in urna. Pellentesque lobortis faucibus pretium. Sed finibus turpis eu ligula vulputate, ac egestas risus cursus. Donec vel ante nec ipsum cursus lacinia vitae eget velit. Nullam in blandit sem, volutpat pulvinar ex. Sed eu semper quam. Etiam ac eros aliquet, tempus odio eu, eleifend mauris.'
  },
  {
    question: 'Lorem ipsum 2',
    answer:
      'Proin tempor nisi eu leo scelerisque, vel dictum lectus pulvinar. Nullam bibendum at odio nec malesuada. Vivamus scelerisque viverra sem, vel malesuada sem. Sed feugiat diam ante, sed vestibulum magna semper eu. Vivamus eu ullamcorper turpis. Aliquam vitae felis et mauris volutpat hendrerit. Curabitur euismod placerat tortor in euismod. Donec mollis finibus erat sed rutrum. Aliquam commodo pellentesque velit, vitae pretium dui mattis a. '
  },
  {
    question: 'Lorem ipsum 3',
    answer:
      'Pellentesque massa purus, suscipit vitae rhoncus sit amet, pellentesque facilisis elit. Curabitur tellus ante, vestibulum quis interdum tristique, luctus eget lectus. Sed nec laoreet sapien, non fringilla velit. Proin dictum iaculis leo, ut finibus massa scelerisque at. Nunc gravida nulla eu urna pellentesque, sed consequat nibh ornare.'
  },
  {
    question: 'Lorem ipsum 4',
    answer:
      'Sed nec ipsum eget magna finibus ultrices. Quisque condimentum ligula in massa lobortis malesuada. Nunc et mollis dolor, nec auctor justo. Ut tincidunt condimentum mauris ac tincidunt. Vestibulum porttitor ipsum sit amet neque convallis imperdiet. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.'
  },
  {
    question: 'Lorem ipsum 5',
    answer:
      'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aenean at nisl accumsan, semper lectus eu, feugiat enim. Morbi lobortis, tellus vitae lacinia aliquet, lacus urna ultrices eros, eu finibus turpis neque in libero. Mauris magna augue, venenatis a velit vitae, lobortis commodo orci. Duis finibus molestie nulla, eu porta lorem maximus vitae.'
  }
]

export const Faq = () => {
  const { classes } = useStyles()

  return (
    <div className={classes.container}>
      {faqData.map((item, index) => (
        <Accordion
          key={index}
          sx={{
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&:before': {
              display: 'none'
            },
            '&:not(:last-child)': {
              borderBottom: `1px solid ${colors.invariant.light}`
            }
          }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: colors.invariant.light }} />}
            sx={{
              padding: '16px 0',
              '& .MuiAccordionSummary-content': {
                margin: 0
              }
            }}>
            <Typography
              sx={{
                color: colors.invariant.text,
                fontSize: '16px',
                fontWeight: 500
              }}>
              {item.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              padding: '0 0 16px 0'
            }}>
            <Typography
              sx={{
                color: colors.invariant.text,
                fontSize: '14px',
                opacity: 0.8
              }}>
              {item.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  )
}
