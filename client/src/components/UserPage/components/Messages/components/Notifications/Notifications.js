import React, { Component } from 'react'
import { connect } from 'react-redux'
import './Notifications.css'

import { acceptFriendshipRequested, rejectFriendshipRequested, getUserNotificationsRequested } from 'redux/modules/messages'

class Notifications extends Component {
  componentDidMount() {
    const { getUserNotificationsRequested, userId } = this.props

    getUserNotificationsRequested(userId)
  }

  render() {
    const { notifications, acceptFriendshipRequested, rejectFriendshipRequested, userId } = this.props
    return (
      <ul className="notifications">
        {notifications.toJS().map((item, i) => (
          <li key={i}>
            {item.action_user_id}
            <button type="button" onClick={() => acceptFriendshipRequested(item.action_user_id, userId)}>Accept</button>
            <button type="button" onClick={() => rejectFriendshipRequested(item.action_user_id, userId)}>Reject</button>
          </li>
        ))}
      </ul>
    )
  }
}


const mapStateToProps = state => ({
  notifications: state.getIn(['messages', 'notifications']),
  userId: state.getIn(['global', 'userData', 'id'])
})

export default connect(
  mapStateToProps,
  {
    acceptFriendshipRequested,
    rejectFriendshipRequested,
    getUserNotificationsRequested
  }
)(Notifications)
