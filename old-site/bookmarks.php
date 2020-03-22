<?php

  // Bookmark management script
  // Richard Harris, July 2005
  
  // This should really use three tables instead of two. It breaks a normal form :P
  
  // Header
  mysql_connect("localhost");
  mysql_select_db("bookmarks");
  
  function h($s) { return htmlspecialchars($s); }
  function e($s) { return mysql_real_escape_string($s); }
  
  // Redirection stub
  if(isset($_GET['redir']))
  {
    $now = time();
    $id  = intval($_GET['id']);
    mysql_query("UPDATE bookmarks SET visited = FROM_UNIXTIME($now) WHERE id = '$id' LIMIT 1");
    header("Location: " . $_GET['redir']);
    die;
  }
  
?>
<html><head>
<title>Rico's Bookmarks</title>
<style type="text/css">
p, li, h1, h2, h3, input, td { font-family: 'Lucida Sans', Arial, Helvetica, sans-serif; font-size: 10pt; }
p { line-height: 125%; }
a { text-decoration: none; }
a:hover { text-decoration: underline; }
a, a:visited { color: #00c; }
p.minimark { font-size: 80%; }
span.visited, span.unvisited, span.desc, span.meta { font-size: 85%; }
span.desc { }
span.meta { }
h1 { font-size: 14pt; }
h2 { font-size: 12pt; }
h3 { font-size: 10pt; }
input { border: 1px solid gray; padding: 3px; }
span.visited { color: green; }
span.unvisited { color: red; }
ul.tags { margin-left: 0; padding-left: 0; list-style: none; }
ul.tags li { line-height: 120%; }
table#layout td { border-right: 1px solid gray; }
table#layout td table td { border-right: none; } /* ugh */
</style>
</head><body onLoad="document.forms[0].search.focus()">
<h1>Rico's Bookmarks</h1>
<form action="" method="GET">
<p><a href="?">Home</a> | <a href="?new">Add</a> | Search: <input type="text" name="search"<? if($_GET['search']) echo ' value="' . h($_GET['search']) . '"';
?> onClick="this.value=''"> <input type="submit" name="s1" value="Go"></p>
</form>
<table cellpadding="25" cellspacing="0" border="0" id="layout">
  <tr>
    <td valign="top">
<?
  // Content
  if(isset($_GET['search']))
  {
    $query = $_GET['search'];
    $marks = mysql_query("SELECT id, title, url, descr, tags, UNIX_TIMESTAMP(posted) posted,
                          UNIX_TIMESTAMP(visited) visited FROM bookmarks
			  WHERE MATCH(url,title,descr,tags) AGAINST ('" . e($query) . "')
			  ORDER BY MATCH(url,title,descr,tags) AGAINST ('" . e($query) . "')");
    bookmark_list_html($marks);
  }
  else if(isset($_GET['new']))
  {
    if($_POST['data_sent'])
    {
      $data = $_POST['data'];
      $url = $data['url']; $title = $data['title'];
      $descr = $data['descr']; $tags = $data['tags'];
      
      if(!$url || !$title || !$tags)
      {
        echo "<p>Please fill in all bolded fields.</p>";
        bookmark_form($data);
      }
      else
      {
        mysql_query("INSERT INTO bookmarks SET url = '" . e($url) . "', title = '" . e($title) . "',
                     descr = '" . e($descr) . "', tags = '" . e($tags) . "', posted = NOW()");
        echo "<p>Okay, bookmark added.</p>\n";
        rebuild_tags();
      }
    }
    else
    {
      echo "<h3>Add bookmark!</h3>\n";
      $init['title'] = $_GET['title'];
      $init['url'] = $_GET['url'];
      bookmark_form($init);
    }
  }
  else if(isset($_GET['edit']))
  {
    $id = $_GET['edit'];
    if($_POST['data_sent'])
    {
      if($_POST['delete'] == 'on')
      {
        mysql_query("DELETE FROM bookmarks WHERE id = '" . e($id) . "'");
        echo "<p>Okay, bookmark deleted.</p>\n";
        rebuild_tags();
      }
      else
      {
        $data = $_POST['data'];
        $url = $data['url']; $title = $data['title'];
        $descr = $data['descr']; $tags = $data['tags'];

        if(!$url || !$title || !$tags)
        {
          echo "<p>Please fill in all bolded fields.</p>";
          bookmark_form($data, $id);
        }
        else
        {
          mysql_query("UPDATE bookmarks SET url = '" . e($url) . "', title = '" . e($title) . "',
                       descr = '" . e($descr) . "', tags = '" . e($tags) . "' WHERE id = '" . e($id) . "'");
          echo "<p>Okay, bookmark updated.</p>\n";
          rebuild_tags();
        }
      }
    }
    else
    {
      $info = mysql_fetch_assoc(mysql_query("SELECT title, url, descr, tags
                                             FROM bookmarks WHERE id = '" . e($id) . "'"));
      echo "<h3>Editing bookmark</h3>\n";
      bookmark_form($info, $id);
    }
  }
  else if(isset($_GET['tag']))
  {
    $tag = $_GET['tag'];
    echo "<h2>Bookmarks under '" . h($tag) . "'</h2>";
    bookmark_list($tag, 'posted desc');
  }
  else
  {
    echo "<h2>All bookmarks</h2>\n";
    bookmark_list('', 'posted desc');
  }

  // Footer
?>
    </td>
    <td valign="top">
    <h3>Todo</h3>
    <? bookmark_list('todo', 'posted asc', true); ?>
    </td><td valign="top">
    <h3>Checklater</h3>
    <? bookmark_list('checklater', 'isnull(visited) desc, visited asc', true, true); ?>
    </td>
    <td valign="top" style="border: none">
    <h3>Tags</h3>
    <? tag_list(); ?>
    </td>
  </tr>
</table>
</body></html>
<?
  // Functions
  function bookmark_list($tag, $order, $small_text = false, $use_visited = false)
  {
    $tag = str_replace('%', '%%', e($tag));
    $order = e($order);
    $marks = mysql_query("SELECT id, title, url, descr, tags, UNIX_TIMESTAMP(posted) posted,
                         UNIX_TIMESTAMP(visited) visited FROM bookmarks WHERE tags LIKE '%$tag%' ORDER BY $order");
    bookmark_list_html($marks, $small_text, $use_visited);
  }
  
  function bookmark_list_html($marks, $small_text = false, $use_visited = false)
  {
    while($mark = mysql_fetch_assoc($marks))
    {
      if($small_text) $cls = ' class="minimark"';
      if($use_visited)
      {
        echo "<p$cls>" . bookmark_html($mark, false) . "<br />\n";
        if($mark['visited'])
          echo '<span class="visited">Last visited: ' . rel_date($mark['visited']) . "</span>";
        else echo '<span class="unvisited">Unvisited</span>';
        echo '<span class="meta"> <b>&middot;</b> <a href="?edit='
            . $mark['id'] . '">edit</a></span></p>';
      }
      else echo "<p$cls>" . bookmark_html($mark) . "</p>\n";
    }
  }
  
  function tag_list()
  {
    $tags = explode(" ", file_get_contents('bookmarks.tags'));
    if($tags)
    { 
      echo '<ul class="tags">' . "\n";
      foreach($tags as $tag)
        echo '<li><a href="?tag=' . $tag . '">' . $tag . "</a></li>\n";
      echo "</ul>\n";
    }
  }
  
  function bookmark_html($bmark, $full = true)
  {
    $h = '<a href="?redir=' . $bmark['url'] . '&id=' . $bmark['id'] . '">' . $bmark['title'] . "</a>\n";
    if($bmark['descr']) $h.= '<br /><span class="desc">' . $bmark['descr'] . "</span>\n";
    if($full)
      $h.= '<br /><span class="meta">posted in ' . link_tags($bmark['tags']) . ' on '
            . date("d-m-Y", $bmark['posted']) . ' <b>&middot;</b> <a href="?edit='
            . $bmark['id'] . '">edit</a></span></p>';
    return $h;
  }
  
  function link_tags($tags)
  {
    return preg_replace("#([a-z]*)#", '<a href="?tag=$1">$1</a>', $tags);
  }
  
  function rel_date($stamp)
  {
    $now = time();
    $day = 24*60*60;
    if($stamp + $day >= $now) return "today";
    if($stamp + 2 * $day >= $now) return "yesterday";
    for($i = 0; $i < 100; $i++)
      if($stamp + $i * $day >= $now) return "$i days ago";

    for($i = 0; $i < 12; $i++)
      if($stamp + $i * $day * 30 >= $now) return "$i months ago";
      
    return "long ago";
  }
  
  function rebuild_tags()
  {
    $tags = array();
    $bookmarks = mysql_query("SELECT tags FROM bookmarks");
    while(list($taglist) = mysql_fetch_row($bookmarks))
      $tags = array_merge($tags, explode(" ", $taglist));
      
    $tags = array_unique($tags);
    sort($tags, SORT_STRING);
      
    $f = fopen("bookmarks.tags", "w");
    fwrite($f, implode(" ", $tags));
    fclose($f);
  }
  
  function bookmark_form($data = null, $editing_id = 0)
  {
    ?>
      <form action="?<?= $editing_id?"edit=$editing_id":"new"; ?>" method="POST">
      <table cellpadding="5" cellspacing="0" border="0">
        <tr><td><b>URL</b></td><td><input type="text" size="80" name="data[url]" value="<?= $data['url'] ?>"></td></tr>
        <tr><td><b>Title</td><td><input type="text" size="80" name="data[title]" value="<?= $data['title'] ?>"></td></tr>
        <tr><td>Desc.</b></td><td><input type="text" size="80" name="data[descr]" value="<?= $data['descr'] ?>"></td></tr>
        <tr><td><b>Tags</b></td><td><input type="text" size="80" name="data[tags]" value="<?= $data['tags'] ?>"></td></tr>
        <? if($editing_id) { ?>
          <tr><td colspan="2"><input type="checkbox" name="delete"> Delete</td></tr>
        <? } ?>
        <tr><td colspan="2" align="center">
          <input type="submit" name="data_sent" value="<?= $editing_id?"Update":"Add" ?>">
        </td></tr>
      </table>
      </form>
    <?
  }
