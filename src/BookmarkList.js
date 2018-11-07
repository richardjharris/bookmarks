import React, { Component } from 'react';
import BookmarkItem from './BookmarkItem';

class BookmarkList extends Component {
  makeBookmarkElement = bookmark => {
    return <BookmarkItem
      key={bookmark.id}
      bookmark={bookmark}
      editItem={this.props.editItem}
      removeItem={this.props.removeItem}
    />
  }

  render = () => {
    const items = this.props.items;
    const elems = items.map(this.makeBookmarkElement);

    return (
      <ul style={{paddingLeft: 0}}>{elems}</ul>
    )
  }
}

export default BookmarkList;