import React, { PureComponent } from 'react';

class AddBookmarkInlineForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      url: '',
      title: '',
      tags: '',
      notes: '',
    };
  }

  canBeSubmitted = () => {
    const { url, title } = this.state;
    return url.length > 0 && title.length > 0;
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit = e => {
    e.preventDefault();

    // Prevent submission via Enter key (which can happen even
    // if the button is disabled)
    if (!this.canBeSubmitted()) {
      return;
    }

    if (this.props.onSubmit(this.state)) {
      // Accepted
      this.setState({ url: '', title: '', tags: '', notes: '' });
    }
  }

  render() {
    const canBeSubmitted = this.canBeSubmitted();

    return (
      <form onSubmit={this.handleSubmit} className="bookmarkForm">
        <input type="text" name="url" placeholder="URL"
          onChange={this.handleChange} value={this.state.url}>
        </input>
        <input type="text" name="title" placeholder="Title"
          onChange={this.handleChange} value={this.state.title}>
        </input>
        <input type="text" name="title" placeholder="Notes"
          onChange={this.handleChange} value={this.state.notes}>
        </input>
        <input type="text" name="tags" placeholder="Tags"
          onChange={this.handleChange} value={this.state.tags}>
        </input>
        <button disabled={!canBeSubmitted}>Add Bookmark</button>
      </form>
    );
  }
}

export default AddBookmarkInlineForm;