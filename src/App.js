import React, { Component } from 'react';
import firebase from './firebase.js';
import ReactModal from 'react-modal';

import BookmarkList from './BookmarkList';
import FilterableBookmarkList from './FilterableBookmarkList';
import AddBookmarkInlineForm from './AddBookmarkInlineForm';
import BookmarkItem from './BookmarkItem';
import './App.css';

/*
 * Top-level component that defines the whole page, and manages the global state
 * (list of all bookmarks) and authentication.
 */
class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      username: 'rjh',
      items: [],
      tags: [],
      // If set, display a modal for deleting a bookmark
      modalDelete: null,
    };
    this.addItemFromFormData({
      url: "http://www.google.com/" + Math.random(10),
      title: "Foo " + Math.random(),
      notes: '',
      tags: 'random',
    })
  }

  handleModalClose = () => {
    this.setState({
      modalDelete: null,
    })
  }

  bookmarks() {
    return firebase.firestore().collection('bookmarks');
  }

  // Load all bookmarks from Firebase, and monitor new ones
  componentDidMount() {
    this.bookmarks().orderBy('added', 'desc')
      .onSnapshot({ includeMetadataChanges: true }, snapshot => {    
      let newItems = [];
      let newTags = new Set([]);

      console.log(`Updating bookmarks: source = ${snapshot.metadata.fromCache ? 'cache' : 'server'}`)

      snapshot.forEach(doc => {
        const data = doc.data();
        newItems.push({
          ...data,
          id: doc.id,
          // Cached reads will be missing the server timestamp
          added: (data.added ? data.added.toDate() : new Date()),
        })
        for (const tag in data.tags) {
          newTags.add(tag);
        }
      });

      this.setState({
        items: newItems,
        tags: Array.from(newTags).sort(),
      });
    });
  }

  addItemFromFormData = data => {
    function makeTagMap(tagString) {
      let tags = {};
      const nonEmpty = tag => tag.match(/\S/);
  
      tagString.split(/\s+/).filter(nonEmpty).forEach(tag => {
        tags[tag] = true;
      });
      return tags;
    }

    const item = {
      ...data,
      username: this.state.username,
      tags: makeTagMap(data.tags),  // overwrites
      added: firebase.firestore.FieldValue.serverTimestamp(),
    }
    return this.bookmarks().add(item);
  }

  removeItem = item => {
    this.bookmarks().doc(item.id).delete();
  }

  promptToRemoveItem = (item, event) => {
    if (event.shiftKey) {
      // Delete immediately without prompting
      this.removeItem(item);
    }
    else {
      // Display a modal
      this.setState({modalDelete: item});
    }
  };

  render() {
    const header = (
      <header>
        <div className="title">
          <h1>Bookmarks</h1>
        </div>
     </header>
    );

    let sidebarLists = ['todo', 'checklater'].map(tag => {
      const tagItems = this.state.items.filter(item => item.tags[tag]);
      return (
        <section key={tag}>
          <h2>{tag}</h2>
          { tagItems.length > 0
          ? <BookmarkList items={tagItems} removeItem={this.promptToRemoveItem} />
          : <p className="spad">There are no {tag} items.</p>
          }
        </section>
      );
    });

    return (
      <div className="app">
        {header}
        <div className="flexContainer">
          <main className="content">
            { this.state.items.length
            ? <FilterableBookmarkList
                items={this.state.items}
                tags={this.state.tags}
                removeItem={this.promptToRemoveItem}
              />
            : <p className="pad">
                There are no bookmarks. Add one using the form on the left.
              </p>
            }
          </main>
          <aside className="sidebar">
            <section className="addItem">
              <h2>add new</h2>
              <AddBookmarkInlineForm
                onSubmit={this.addItemFromFormData}
              />
            </section>
            {sidebarLists}
          </aside>
        </div>
        <ReactModal isOpen={!!this.state.modalDelete}
          contentLabel="Delete?"
          onRequestClose={this.handleModalClose}
        >
          <p>Really delete this bookmark?</p>
          {/* modal is rendered while modalDelete is null, sometimes */}
          {this.state.modalDelete &&
            <BookmarkItem bookmark={this.state.modalDelete} noHoverLinks={true} />
          }
          <button onClick={() => {
            this.removeItem(this.state.modalDelete);
            this.handleModalClose()
          }}>
            Delete
          </button>
          <button onClick={this.handleModalClose}>
            Cancel
          </button>
        </ReactModal>
      </div>
    )
  }
};

export default App;