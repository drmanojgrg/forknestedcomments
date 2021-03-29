
import React, { useState } from "react"
import styled from "styled-components"
import PropTypes from "prop-types"
import firebase from "./firebase"

const CommentBox = styled.div`
  input,
  textarea {
    display: block;
    background-color: #fff;
    border: 2px solid #ddd;
    font-size: 16px;
    font-family: "Hind", sans-serif;
    font-weight: 400;
    padding: 10px 12px 8px;
    width: 100%;
    font-variant-numeric: lining-nums;
    font-feature-settings: "lnum";
  }
  input[type="text"] {
    width: 50%;
  }
  label {
    display: block;
    margin-bottom: 20px;
  }
`

const CommentForm = ({ parentId, questionID }) => {
  // const [name, setName] = useState("")
  const [content, setContent] = useState("")

  const handleCommentSubmission = async e => {
    e.preventDefault()
    let comment = {
      // name,
      commentText:content,
      pId: parentId || null,
      time: new Date(),
    }
    // setName("")
    setContent("")
    
    debugger
       const mainQuestionBank =firebase.db.collection('postsThreads')
      .doc('Preventive Medicine')
      .collection(`comments`).doc("asldhfjjklahsd")

mainQuestionBank.get().then((doc) => {
      if (doc.exists) {
        mainQuestionBank.update(
{
          comments: firebase.firestore.FieldValue.arrayUnion(comment),
      },
        );
      } else {
        mainQuestionBank.set(
         {
          comments: firebase.firestore.FieldValue.arrayUnion(comment),
      },{isMerge: true})
    
      }
    });

  }

  return (
    <CommentBox>
      <form onSubmit={e => handleCommentSubmission(e)}>
       
        <label htmlFor="comment">
          Comment
          <textarea
            id="comment"
            onChange={e => setContent(e.target.value)}
            value={content}
            name="comment"
            required="required"
            cols="45"
            rows="8"
          ></textarea>
        </label>
        <button type="submit" className="btn">
          Submit
        </button>
      </form>
    </CommentBox>
  )
}

CommentForm.propTypes = {
  parentId: PropTypes.string,
  slug: PropTypes.string.isRequired
}

export default CommentForm