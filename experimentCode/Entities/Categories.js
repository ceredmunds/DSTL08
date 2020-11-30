var Category = {
  PENDING: 0,
  UNKNOWN: 1,
  FRIEND: 2,
  NEUTRAL: 3,
  HOSTILE: 4,
  ASSUMED_FRIEND: 5,
  ASSUMED_HOSTILE: 6,
  UNCERTAIN_FRIEND: 7,
  UNCERTAIN_HOSTILE: 8,

  getLabel: function (category) {
    label = ''
    // console.log('category ' + category)

    category = parseInt(category)
    switch (category) {
      case 0: // category.PENDING:
        label = 'PENDING'
        break
      case 1: // category.UNKNOWN:
        label = 'UNKNOWN'
        break
      case 2: // category.FRIEND:
        label = 'FRIEND'
        break
      case 3: // category.NEUTRAL:
        label = 'NEUTRAL'
        break
      case 4: // category.HOSTILE:
        label = 'HOSTILE'
        break
      case 5: // category.ASSUMED_FRIEND:
        label = 'ASSUMED_FRIEND'
        break
      case 6: // category.ASSUMED_HOSTILE:
        label = 'ASSUMED_HOSTILE'
        break
      case 7: // category.UNCERTAIN_FRIEND:
        label = 'UNCERTAIN_FRIEND'
        break
      case 8: // category.UNCERTAIN_HOSTILE:
        label = 'UNCERTAIN_HOSTILE'
        break
      default:
        label= ' ERROR'
      //   console.log('Error switch')
    }
    return label
  },

  getUILabel: function (category) {
    label = ''
    // console.log('category ' + category)

    category = parseInt(category)
    switch (category) {
      case 0: // category.PENDING:
        label = 'Pending'
        break
      case 1: // category.UNKNOWN:
        label = 'Unknown'
        break
      case 2: // category.FRIEND:
        label = 'Friend'
        break
      case 3: // category.NEUTRAL:
        label = 'Neutral'
        break
      case 4: // category.HOSTILE:
        label = 'Hostile'
        break
      case 5: // category.ASSUMED_FRIEND:
        label = 'Assumed friend'
        break
      case 6: // category.ASSUMED_HOSTILE:
        label = 'Assumed hostile'
        break
      case 7: // category.UNCERTAIN_FRIEND:
        label = 'Uncertain friend'
        break
      case 8: // category.UNCERTAIN_HOSTILE:
        label = 'Uncertain hostile'
        break
      default:
        label= ' Error'
      //   console.log('Error switch')
    }
    return label
  }
}
