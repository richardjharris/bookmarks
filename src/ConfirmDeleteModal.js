import React, { Component } from 'react';
import Modal from 'react-modal';

import BookmarkItem from './BookmarkItem';

class ConfirmDeleteModal extends Component {
  handleDelete = () => {
    this.props.onDelete(this.props.target);
    this.props.onClose();
  }

  render() {
    const bookmark = this.props.target;
    const isOpen = bookmark !== null;
    return (
      <Modal isOpen={isOpen}
        contentLabel="Delete?"
        onRequestClose={this.props.onClose}
      >
        <p>Really delete this bookmark?</p>
        {/* modal is rendered while modalDelete is null, sometimes */}
        {bookmark &&
          <BookmarkItem bookmark={bookmark} noHoverLinks={true} />
        }
        <button onClick={this.handleDelete}>
          Delete
        </button>
        <button onClick={this.props.onClose}>
          Cancel
        </button>
      </Modal>
    );
  }
}

export default ConfirmDeleteModal;