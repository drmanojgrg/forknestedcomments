import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Comment from './Comment';
import CommentForm from './CommentForm';
import styled from 'styled-components';
import firebase from '../firebase';

const CommentList = styled.div`
  article {
    margin-bottom: 20px;
  }
`;

const Comments = () => {
  const slug = '879ba741-ed28-437b-b053-aaa2cc9528c5';
  var [comments, setComments] = useState([]);
  const [content, setContent] = useState('');

  const commentsColRef = firebase.db
    .collection('questions')
    .doc('Preventive Medicine')
    .collection('questions')
    .doc(`879ba741-ed28-437b-b053-aaa2cc9528c5`)
    .collection('comments');

  React.useEffect(() => {
    commentsColRef.onSnapshot((snapshot) => {
      const posts = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
      setComments(posts);
    });
  }, []);
  return (
    <div>
      <h2>Join the discussion</h2>
      <CommentForm slug={slug} />
      <CommentList>
        {comments.length > 0 &&
          comments
            .filter((comment) => !comment.pId)
            .map((comment) => {
              let child;
              if (comment.id) {
                child = comments.find((c) => comment.id === c.pId);
              }
              return (
                <Comment
                  key={comment.id}
                  child={child}
                  comment={comment}
                  slug={slug}
                />
              );
            })}
      </CommentList>
    </div>
  );
};

Comments.propTypes = {
  slug: PropTypes.string.isRequired,
  comments: PropTypes.array.isRequired,
};

export default Comments;
