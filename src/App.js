import React, { Component } from 'react';
import BookmarkList from './BookmarkList';
import FilterableBookmarkList from './FilterableBookmarkList';
import AddBookmarkInlineForm from './AddBookmarkInlineForm';
import firebase from './firebase.js';
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
    };
  }

  database(ref) {
    return firebase.database().ref(ref || 'bookmarks');
  }

  // Load all bookmarks from Firebase, and monitor new ones
  componentDidMount() {
    this.database().on('value', (snapshot) => {
      let items = snapshot.val();
      let newItems = [];
      let newTags = new Set([]);
      // Sort bookmarks newest-first
      for (const item of Object.keys(items).sort().reverse()) {
        newItems.push({
          id: item,
          tags: {},  // default if missing - Firebase cannot handle empty objects
          ...items[item],
        })
        for (const tag in items[item].tags) {
          newTags.add(tag);
        }
      }
      this.setState({
        items: newItems,
        tags: Array.from(newTags).sort(),
      });
    });
  }

  makeTagMap = (tagString) => {
    let tags = {};
    const nonEmpty = tag => tag.match(/\S/);

    tagString.split(/\s+/).filter(nonEmpty).forEach(tag => {
      tags[tag] = true;
    });
    return tags;
  }

  handleAddBookmarkFormSubmit = data => {
    const item = {
      ...data,
      username: this.state.username,
      tags: this.makeTagMap(data.tags),  // overwrites
      added: firebase.database.ServerValue.TIMESTAMP,
    }
    this.database().push(item);
    // Indicate success so the form can clear itself
    return true;
  }

  removeItem = itemId => {
    this.database(`/bookmarks/${itemId}`).remove();
  }

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
          ? <BookmarkList items={tagItems} removeItem={this.removeItem} />
          : <p className="spad">There are no {tag} items.</p>
          }
        </section>
      );
    });

    return (
      <div className="app">
        {header}
        <div className="content">
          { this.state.items.length
          ? <FilterableBookmarkList
              items={this.state.items}
              tags={this.state.tags}
              removeItem={this.removeItem}
            />
          : <p>There are no bookmarks. Add one using the form on the left.</p>
          }
          <div className="sidebar">
            <section className="addItem">
              <h2>add new</h2>
              <AddBookmarkInlineForm
                onSubmit={this.handleAddBookmarkFormSubmit}
              />
            </section>
            {sidebarLists}
          </div>
        </div>
      </div>
    )
  }
};

export default App;