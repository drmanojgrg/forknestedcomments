import firebase from './firebase';


import React, { useEffect, useState } from 'react';

import PropTypes from "prop-types"
import Comment from "./smashComment"
import CommentForm from "./smashCommentForm"
import styled from "styled-components"

const questionID = '8f7b1386-0dfc-4036-b8da-e660c656726e';
const name = 'manoj gurung';

const CommentList = styled.div`
  article {
    margin-bottom: 20px;
  }
`
//----------------------------------------------------------------------------------------------
//MAIN COMPONENT
//------------------------------------------------------------------------------------------------

const Comments = () => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const cleanUp = firebase.db
      .collection('postsThreads')
      .doc('Preventive Medicine')
      .collection(`comments`)
      .onSnapshot((snapshot) => {
        const posts = snapshot.docs
          // .filter((doc) => doc.data().questionID === questionID)
          .map((doc) => {
            return { id: doc.id, ...doc.data() };
          });
        setComments(posts);
      });

      debugger

    return () => cleanUp();
  }, []);

  return (
    <div>
      <h2>Join the discussion</h2>
      <CommentForm questionID={questionID} />
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
                  questionID={questionID}
                />
              );
            })}
      </CommentList>
    </div>
  );
};

export default Comments;
