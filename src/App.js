import React, { Component } from 'react';

import BookmarkDatabase from './BookmarkDatabase';
import BookmarkList from './BookmarkList';
import FilterableBookmarkList from './FilterableBookmarkList';
import AddBookmarkInlineForm from './AddBookmarkInlineForm';
import ConfirmDeleteModal from './ConfirmDeleteModal';
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
  }

  handleModalClose = () => {
    this.setState({
      modalDelete: null,
    })
  }

  // Load all bookmarks, and monitor new ones
  componentDidMount() {
    BookmarkDatabase.watch(snapshot => {
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
    }
    return BookmarkDatabase.add(item);
  }

  removeItem = item => {
    return BookmarkDatabase.remove(item);
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
        <ConfirmDeleteModal
          target={this.state.modalDelete}
          onClose={this.handleModalClose}
          onDelete={this.removeItem}
        />
      </div>
    )
  }
};

export default App;