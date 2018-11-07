import React, { Component } from 'react';
import TimeAgo from 'react-timeago';
import './BookmarkItem.css';

class BookmarkItem extends Component {
  editItem = (e) => {
    e.preventDefault();
    this.props.editItem(this.props.bookmark, e);
  }
  removeItem = (e) => {
    e.preventDefault();
    this.props.removeItem(this.props.bookmark, e);
  }

  render = () => {
    const bookmark = this.props.bookmark;
    const noHoverLinks = this.props.noHoverLinks;

    let tags = Object.keys(bookmark.tags);
    //if (this.props.hideTag) tags = tags.filter(x => x !== this.props.hideTag);

    const link = <a href={bookmark.url}>{bookmark.title}</a>;
    const tagList = tags.map((tag) => (
      <span key={tag}> &middot; {tag}</span>
    ));
    const hoverLinks = noHoverLinks ? null : (
      <span className="hoverLinks">
        <button onClick={this.editItem}>edit</button>
        &nbsp;
        <button onClick={this.removeItem}>delete</button>
      </span>
    );

    // Show 'just now', then '1 minute ago', and so on
    const uploadedAgo = <TimeAgo
      date={bookmark.added}
      minPeriod={60}
      formatter={(value, unit, suffix, then, nextFormatter) =>
        (unit === 'second' && value === 0) ? 'just now'
          : nextFormatter(value, unit, suffix, then)
        } 
    ></TimeAgo>

    return (
      <li key={bookmark.id} className="item">
        <div className="link">{link}</div>
        {bookmark.notes &&
          <div className="notes">{bookmark.notes}</div>
        }
        <div className="info">
          Added by {bookmark.username} {uploadedAgo} {tagList} {hoverLinks}
        </div>
      </li>
    );
  }
}

export default BookmarkItem;