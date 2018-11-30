import React, { Component, Fragment } from 'react'
import { NavLink } from 'react-router-dom'
import { Switch, Route } from 'react-router'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { getUserMsgsRequested } from 'redux/modules/messages'
import { getUsersRequested } from 'redux/modules/users'
import './Messages.css'
import Conversations from './components/Conversations/Conversations'
import Notifications from './components/Notifications/Notifications'

class Messages extends Component {
  state = {
    dialogContent: [],
    componentBody: 'conversations'
  }

  componentDidMount() {
    const { userData, getUserMsgsRequested } = this.props
    getUserMsgsRequested(userData.get('id'))
  }

  static getDerivedStateFromProps(nextProps, prevState) {


    if (nextProps.conversations !== prevState.conversations) {
      const avatars = {}

      nextProps.friendsAvatars.forEach(item => {
        avatars[item.get('id')] = item.get('avatar')
      })

      let conversationsList = nextProps.conversations.toJS()
      let obj = {}

      for (let i = 0; i < conversationsList.length;) {
        const id = conversationsList[0].sender_id === nextProps.userData.get('id') ? conversationsList[0].receiver_id : conversationsList[0].sender_id

        obj[id] = conversationsList.filter(el => el.sender_id === id || el.receiver_id === id)
        conversationsList = conversationsList.filter(el => el.sender_id !== id && el.receiver_id !== id)
      }

      return {
        avatars,
        fullMessageHistory: obj
      }
    }
    return null
  }

  getDialogWithId = id => {
    this.setState(previousState => ({
      dialogContent: previousState.fullMessageHistory[id],
      interlocutorId: id
    }))
  }

  render() {
    const { match } = this.props

    const {
      fullMessageHistory,
      dialogContent,
      avatars,
      interlocutorId,
      componentBody
    } = this.state

    let keys
    let opts
    let msgs

    if (fullMessageHistory) {
      keys = Object.keys(fullMessageHistory)
      opts = Object.keys(fullMessageHistory).map(
        key => fullMessageHistory[key]
      )
    }
    return (
      <Fragment>
        <nav className="navbar">
          <ul>
            <NavLink
              className="nav-link"
              to={`${match.url}/conversations`}
            >
              Conversations
            </NavLink>
            <NavLink
              className="nav-link"
              to={`${match.url}/notifications`}
              >
             Notifications
            </NavLink>
          </ul>
        </nav>
    
        <div className="flex-container">
          <Switch>
            <Route path={`${match.url}/notifications`} component={Notifications} />
            <Route
              path={`${match.url}/conversations`}
              render={() => (
                <Conversations
                  dialogContent={dialogContent}
                  interlocutorId={interlocutorId}
                  msgs={msgs}
                  getDialogWithId={this.getDialogWithId}
                  userId={this.props.userData.get('id')}
                  avatars={avatars}
                  opts={opts}
                  keys={keys}
                />
              )}
            />
          </Switch>
        </div>
      </Fragment>
    )
  }
}

const mapStateToProps = state => ({
  userData: state.getIn(['global', 'userData']),
  conversations: state.getIn(['messages', 'conversations']),
  friendsAvatars: state.get('friends')
})

export default connect(
  mapStateToProps,
  {
    getUserMsgsRequested: id => getUserMsgsRequested(id),
    getUsersRequested: id => getUsersRequested(id)
  }
)(Messages)
