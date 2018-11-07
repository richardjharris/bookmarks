import React, { PureComponent } from 'react';

class SearchBox extends PureComponent {
  handleChange = (e) => {
    this.props.onChange(e.target.value);
  };

  render() {
    return (
      <input placeholder="Search" type="search"
        value={this.props.value} onChange={this.handleChange}>
      </input>
    );
  }
}

export default SearchBox;