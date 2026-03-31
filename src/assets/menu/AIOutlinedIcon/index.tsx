import Icon from '@ant-design/icons'

const AISvg = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 7.5V3H7.6M1 14.25H3.2M20.8 14.25H23M15.3 13.125V15.375M8.7 13.125V15.375M5.4 7.5H18.6C19.815 7.5 20.8 8.50736 20.8 9.75V18.75C20.8 19.9926 19.815 21 18.6 21H5.4C4.18497 21 3.2 19.9926 3.2 18.75V9.75C3.2 8.50736 4.18497 7.5 5.4 7.5Z"
        stroke="#353639"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
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
