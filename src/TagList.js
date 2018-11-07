import React, { Component, PureComponent } from 'react';
import './TagList.css';

// XXX auto unselect when tags updated and selected item no longer applies

class Tag extends PureComponent {
  onClick = e => {
    this.props.onClick(this.props.tag);
  };

  render() {
    const { selected, tag } = this.props;
    return (
      <button
        className={`tag ${selected ? 'selected' : ''}`}
        onClick={this.onClick}
      >{tag}</button>
    );
  }
}

class TagList extends Component { 
  // Clicking the selected tag undoes the filter. Otherwise, changes the selection
  // to the new tag.
  onClick = tagName => {
    if (this.props.selected === tagName) {
      this.props.onChange('');
    }
    else {
      this.props.onChange(tagName);
    }
  }

  render() {
    const tags = this.props.tags;
    const selectedTag = this.props.selected;
    return (
      <div className="tagList">
        {tags.map(tag => (
          <Tag
            tag={tag}
            key={tag}
            onClick={this.onClick}
            selected={selectedTag === tag}
          />
        ))}
      </div>
    );
  }
}

export default TagList;