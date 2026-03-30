import Icon from '@ant-design/icons'

const AISvg = () => {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 10.5V20M4 20L5.38889 15M5.38889 15L8.03648 5.46868C8.30772 4.49221 9.69228 4.49221 9.96352 5.46868L12.6111 15M5.38889 15H12.6111M14 20L12.6111 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 7L22.1249 7.46386C22.3102 8.15215 22.8479 8.68979 23.5361 8.87511L24 9L23.5361 9.12489C22.8479 9.31021 22.3102 9.84785 22.1249 10.5361L22 11L21.8751 10.5361C21.6898 9.84785 21.1521 9.31021 20.4639 9.12489L20 9L20.4639 8.87511C21.1521 8.68979 21.6898 8.15215 21.8751 7.46386L22 7Z"
        fill="currentColor"
      />
      <path
        d="M18 0L18.2498 0.927722C18.6204 2.3043 19.6957 3.37957 21.0723 3.75021L22 4L21.0723 4.24979C19.6957 4.62043 18.6204 5.6957 18.2498 7.07228L18 8L17.7502 7.07228C17.3796 5.6957 16.3043 4.62043 14.9277 4.24979L14 4L14.9277 3.75021C16.3043 3.37957 17.3796 2.3043 17.7502 0.927723L18 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

const AIOutlinedIcon = () => {
  return (
    <Icon
      component={AISvg}
      style={{
        marginRight: '10px',
        fontSize: 16,
        width: 16,
        height: 16,
      }}
    />
  )
}

export default AIOutlinedIcon
