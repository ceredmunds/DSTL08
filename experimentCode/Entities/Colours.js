var Colour = {
  GRAY: 0,
  GREEN: 1,
  BLUE: 2,
  PURPLE: 3,
  YELLOW: 4,
  RED: 5,
  C_GREEN: 6,
  C_RED: 7,
  C_BLUE: 8,

  getLabel: function (color) {
    label = ''
    color = parseInt(color)
    switch (color) {
      case 0:
        label = 'GRAY'
        break
      case 1:
        label = 'GREEN'
        break
      case 2:
        label = 'BLUE'
        break
      case 3:
        label = 'PURPLE'
        break
      case 4:
        label = 'YELLOW'
        break
      case 5:
        label = 'RED'
        break
      case 6:
        label = 'C_GREEN'
        break
      case 7:
        label = 'C_RED'
        break
      case 8:
        label = 'C_BLUE'
        break
      default:
        label = 'ERROR'
        break
    }
    return label
  }
}
