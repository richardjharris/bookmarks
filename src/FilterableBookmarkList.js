import React, { PureComponent } from 'react';
import BookmarkList from './BookmarkList';
import TagList from './TagList';
import SearchBox from './SearchBox';

class FilterableBookmarkList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      filterString: '',
      selectedTag: '',
    }
  }

  onFilterStringChange = filterString => {
    this.setState({filterString});
  };

  onSelectedTagChange = selectedTag => {
    this.setState({selectedTag});
  }

  filteredItems = () => {
    const filterString = this.state.filterString.toLowerCase();
    const selectedTag = this.state.selectedTag;
    return this.props.items.filter(item => {
      return ((filterString === '' || item.title.toLowerCase().indexOf(filterString) !== -1)
      && (selectedTag === '' || item.tags[selectedTag]));
    });
  };

  render = () => {
    const items = this.filteredItems();
    return (
      <div className="bookmarkList">
      <TagList
        tags={this.props.tags}
        selected={this.state.selectedTag}
        onChange={this.onSelectedTagChange}
      />
      <div className="spad" style={{paddingTop: 0}}>
        <SearchBox
          value={this.state.filterString}
          onChange={this.onFilterStringChange}
        />
      </div>
      <div className="pad">
        { items.length > 0
        ? <BookmarkList
            items={this.filteredItems()}
            removeItem={this.props.removeItem}
          />
        : <p>There are no items that match your criteria.</p>
        }
      </div>
    </div>
    );
  }
}

export default FilterableBookmarkList;