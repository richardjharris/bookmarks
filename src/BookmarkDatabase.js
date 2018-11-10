import firebase from './firebase.js';

class BookmarkDatabase {
  static bookmarkCollection() {
    return firebase.firestore().collection('bookmarks');
  }

  static watch(func, orderBy = ['added', 'desc']) {
    this.bookmarkCollection().orderBy(...orderBy)
      .onSnapshot({ includeMetadataChanges: true }, func);
  }

  static add(item) {
    return this.bookmarkCollection().add({
      ...item,
      added: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } 

  static remove(item) {
    return this.bookmarkCollection().doc(item.id).delete();  
  }
}

export default BookmarkDatabase;