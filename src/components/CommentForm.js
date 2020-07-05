import React, { Component } from "react";
import {MentionsInput, Mention} from 'react-mentions';
import defaultStyle from './defaultStyle';
import defaultMentionStyle from './defaultMentionStyle'

export default class CommentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: "",
      typingTimeout: 0,
      comment: {
        text: ""
      }
    };

    // bind context to methods
    this.fetchUsers = this.fetchUsers.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  fetchUsers(query, callback) {
    console.log("fetching")
    if (!query) return

    const self = this
    if (self.state.typingTimeout) {
      clearTimeout(self.state.typingTimeout);
    }
    self.setState({
      typingTimeout: setTimeout(function () {
        fetch(`https://api.github.com/search/users?q=${query}`, { json: true })
          .then(res => res.json())

          // Transform the users to what react-mentions expects
          .then(res =>
            res.items.map(user => ({ display: user.login, id: user.login }))
          )
          .then(callback)
      }, 3000)
    })
  }
  /**
   * Handle form input field changes & update the state
   */
  handleFieldChange = event => {
    console.log(event)
    const { value } = event.target;

    this.setState({
      comment: {
        text: value
      }
    });
  };

  /**
   * Form submit handler
   */
  onSubmit(e) {
    // prevent default form submission
    e.preventDefault();

    if (!this.isFormValid()) {
      this.setState({ error: "All fields are required." });
      return;
    }

    // loading status and clear error
    this.setState({ error: "", loading: true });

    // persist the comments on server
    let { comment } = this.state;

    fetch("/comments/", {
      method: "post",
      body: JSON.stringify(comment)
    })
      .then(res => res.json())
      .then(res => {
        if (res.error) {
          this.setState({ loading: false, error: res.error });
        } else {
          comment.id = res.data[0].id;
          //console.log(res[0].id);
          this.props.addComment(comment);

          // clear the message box
          this.setState({
            loading: false,
            comment: { text: "" }
          });
        }
      })
      .catch(err => {
        this.setState({
          error: "Something went wrong while submitting form.",
          loading: false
        });
      });
  }

  /**
   * Simple validation
   */
  isFormValid() {
    return this.state.comment.text !== "";
  }

  renderError() {
    return this.state.error ? (
      <div className="alert alert-danger">{this.state.error}</div>
    ) : null;
  }

  render() {
    return (
      <React.Fragment>
        <form method="post" onSubmit={this.onSubmit}>

          <div className="form-group">

            <MentionsInput
              value={this.state.comment.text}
              onChange={this.handleFieldChange}
              placeholder="Mention any Github user by typing `@` followed by at least one char"
              style={defaultStyle}
            >
              <Mention
                displayTransform={login => `@${login}`}
                trigger="@"
                data={this.fetchUsers}
                style={defaultMentionStyle}
              />
            </MentionsInput>
          </div>

          {this.renderError()}

          <div className="form-group">
            <button disabled={this.state.loading} className="btn btn-primary">
              Comment &#10148;
            </button>
          </div>
        </form>
      </React.Fragment>
    );
  }
}
