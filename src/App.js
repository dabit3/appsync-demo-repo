import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { graphql, compose } from 'react-apollo'
import { graphqlMutation } from 'aws-appsync-react'
import { buildSubscription } from 'aws-appsync'
import gql from 'graphql-tag'

const listQuestions = gql`
  query {
    listQuestions {
      items {
        id
        body
        createdAt
      }
    }
}
`

const CreateQuestion = gql`
  mutation($body: String!, $flagged: Boolean) {
    createQuestion(input: {
      body: $body
      flagged: $flagged
    }) {
      id
      createdAt
      body
      flagged
    }
  }
`
/*
onCreateQuestion(
		body: String,
		createdAt: AWSDateTime,
		flagged: Boolean,
		id: ID
	): Question
*/

const QuestionSubscription = gql`
  subscription {
    onCreateQuestion {
      body
      createdAt
      flagged
      id
    } 
  }
`

class App extends Component {
  state = { body: ''}
  componentDidMount() {
    this.props.data.subscribeToMore(
      buildSubscription(QuestionSubscription, listQuestions)
    )
  }
  onChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  createQuestion = () => {
    this.props.createQuestion({
      body: this.state.body, flagged: false, createdAt: null
    })
    this.setState({ body: '' })
  }
  render() {
    console.log('props:', this.props)
    return (
      <div className="App">
        <input name='body' onChange={this.onChange} />
        <button onClick={this.createQuestion}>Create Question</button>
        {
          this.props.data.listQuestions && this.props.data.listQuestions.items.map((item, i) => (
            <p key={i}>{item.body}</p>
          ))
        }
      </div>
    );
  }
}

export default compose(
  graphqlMutation(CreateQuestion, listQuestions, 'Question'),
  graphql(listQuestions, {
    options: {
      fetchPolicy: 'cache-and-network'
    } 
  })
)(App);
