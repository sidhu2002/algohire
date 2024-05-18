import React, { useState, useEffect } from 'react';

const CommentsSection = () => {
  const [currentUser, setCurrentUser] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ content: '' });

  useEffect(() => {
    const savedComments = JSON.parse(localStorage.getItem('comments')) || [];
    setComments(savedComments);
  }, []);

  useEffect(() => {
    localStorage.setItem('comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    // Load pre-existing comments when the component mounts
    const preExistingComments = [
      { id: 1, username: 'a', content: 'First comment', upvotes: 0, downvotes: 0, replies: [] },
      { id: 2, username: 'b', content: 'Second comment!', upvotes: 0, downvotes: 0, replies: [] }
    ];
    setComments([...preExistingComments, ...comments]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewComment({ ...newComment, [name]: value });
  };

  const handleUserChange = (e) => {
    setCurrentUser(e.target.value);
  };

  const login = () => {
    if (currentUser.trim() !== '') {
      localStorage.setItem('currentUser', currentUser);
    }
  };

  const logout = () => {
    setCurrentUser('');
    localStorage.removeItem('currentUser');
  };

  const addComment = (parentId = null, replyContent = newComment) => {
    if (replyContent.content) {
      const newCommentData = {
        id: Date.now(),
        username: currentUser,
        content: replyContent.content,
        upvotes: 0,
        downvotes: 0,
        replies: []
      };
      const updatedComments = parentId === null ?
        [...comments, newCommentData] :
        addReplyToComment(comments, parentId, newCommentData);
      setComments(updatedComments);
      setNewComment({ content: '' });
    }
  };

  const addReplyToComment = (comments, parentId, newCommentData) => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return { ...comment, replies: [...comment.replies, newCommentData] };
      } else if (comment.replies.length > 0) {
        return { ...comment, replies: addReplyToComment(comment.replies, parentId, newCommentData) };
      } else {
        return comment;
      }
    });
  };

  const updateComment = (id, updatedContent) => {
    const updatedComments = updateCommentContent(comments, id, updatedContent);
    setComments(updatedComments);
  };

  const updateCommentContent = (comments, id, updatedContent) => {
    return comments.map(comment => {
      if (comment.id === id && comment.username === currentUser) {
        return { ...comment, content: updatedContent };
      } else if (comment.replies.length > 0) {
        return { ...comment, replies: updateCommentContent(comment.replies, id, updatedContent) };
      } else {
        return comment;
      }
    });
  };

  const deleteComment = (id) => {
    const updatedComments = deleteCommentById(comments, id);
    setComments(updatedComments);
  };

  const deleteCommentById = (comments, id) => {
    return comments.filter(comment => {
      if (comment.id === id && comment.username === currentUser) {
        return false;
      } else if (comment.replies.length > 0) {
        comment.replies = deleteCommentById(comment.replies, id);
        return true;
      } else {
        return true;
      }
    });
  };

  const voteComment = (id, type) => {
    const updatedComments = updateVoteCount(comments, id, type);
    setComments(updatedComments);
  };

  const updateVoteCount = (comments, id, type) => {
    return comments.map(comment => {
      if (comment.id === id) {
        return { ...comment, [type]: comment[type] + 1 };
      } else if (comment.replies.length > 0) {
        return { ...comment, replies: updateVoteCount(comment.replies, id, type) };
      } else {
        return comment;
      }
    });
  };

  return (
    <div className="comments-section">
      {!currentUser ? (
        <div className="user-login">
          <input
            type="text"
            placeholder="Enter your username"
            value={currentUser}
            onChange={handleUserChange}
          />
          <button onClick={login}>Enter</button>
        </div>
      ) : (
        <>
          <div className="current-user">
            <p>Logged in as: <strong>{currentUser}</strong></p>
            <button onClick={logout}>New User</button>
          </div>
          <div className="add-comment">
            <textarea
              name="content"
              placeholder="Your comment"
              value={newComment.content}
              onChange={handleInputChange}
            />
            <button onClick={() => addComment()}>Add Comment</button>
          </div>
          <div className="comments-list">
            {comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                currentUser={currentUser}
                addComment={addComment}
                updateComment={updateComment}
                deleteComment={deleteComment}
                voteComment={voteComment}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Comment = ({ comment, currentUser, addComment, updateComment, deleteComment, voteComment }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedContent, setUpdatedContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState({ content: '' });
  const [isReplying, setIsReplying] = useState(false);

  const handleEditChange = (e) => {
    setUpdatedContent(e.target.value);
  };

  const handleReplyChange = (e) => {
    const { name, value } = e.target;
    setReplyContent({ ...replyContent, [name]: value });
  };

  const saveEdit = () => {
    updateComment(comment.id, updatedContent);
    setIsEditing(false);
  };

  const addReply = () => {
    addComment(comment.id, replyContent);
    setIsReplying(false);
    setReplyContent({ content: '' });
  };

  return (
    <div className="comment">
      <p><strong>{comment.username}</strong></p>
      {isEditing ? (
        <>
          <textarea value={updatedContent} onChange={handleEditChange} />
          <button onClick={saveEdit}>Save</button>
        </>
      ) : (
        <p>{comment.content}</p>
      )}
      <div className="comment-actions">
        <button onClick={() => voteComment(comment.id, 'upvotes')}>Upvote ({comment.upvotes})</button>
        <button onClick={() => voteComment(comment.id, 'downvotes')}>Downvote ({comment.downvotes})</button>
        {comment.username === currentUser && (
  <>
    <button onClick={() => setIsEditing(!isEditing)}>Edit</button>
    <button onClick={() => deleteComment(comment.id)}>Delete</button>
  </>
)}
<button onClick={() => setIsReplying(!isReplying)}>Reply</button>
</div>
{isReplying && (
  <div className="reply-comment">
    <textarea
      name="content"
      placeholder="Your reply"
      value={replyContent.content}
      onChange={handleReplyChange}
    />
    <button onClick={addReply}>Add Reply</button>
  </div>
)}
{comment.replies.length > 0 && (
  <div className="replies-list">
    {comment.replies.map(reply => (
      <Comment
        key={reply.id}
        comment={reply}
        currentUser={currentUser}
        addComment={addComment}
        updateComment={updateComment}
        deleteComment={deleteComment}
        voteComment={voteComment}
      />
    ))}
  </div>
)}
</div>
);
};

export default CommentsSection;