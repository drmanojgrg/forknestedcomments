import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useReducer,
} from 'react';
import styled from 'styled-components';
import clone from 'lodash.clone';
import { cloneDeep, set, setWith, merge } from 'lodash';

import TextArea from 'react-textarea-autosize';

import Markdown from './Markdown';
import Card from './Card';
import Button from './Button';
import firebase from './firebase';
import { immerable, produce } from 'immer';

const user = 'manoj gurung';

const CommentContext = createContext({});

function compare(a1, a2) {
  if (JSON.stringify(a1) === JSON.stringify(a2)) {
    return true;
  }
  return false;
}

//// REcursive component here //////////////////////////////////////////////////////////////////////////////////////////

function gen_comments(comments, colorindex, path) {
  return comments.map((comment, i) => {
    return (
      <Comment
        username={comment.username}
        date={comment.date}
        text={comment.text}
        votes={comment.votes}
        colorindex={colorindex}
        key={i}
        path={[...path, i]}
        masterComments={comments}
        comments={comment.comments}
      />
    );
  });
}

function Reply(props) {
  const [text, setText] = useState('');

  const dispatch = useContext(DispatchContext);
  const state = useContext(StateContext);

  const handleReply = (event) => {
    if (!!!props.path) {
      console.log('state', state);
      return dispatch({
        type: 'ADD_TO_BASE_COMMENT',
        comments: state,
        payload: {
          username: user,
          date: 'now',
          text,
          votes: 0,
          comments: [],
        },
      });
    }

    dispatch({
      type: 'ADD_COMMENT',
      path: props.path,
      comments: state,
      payload: {
        username: user,
        date: 'now',
        text,
        votes: 0,
        comments: [],
      },
    });
  };

  return (
    <div {...props}>
      <TextArea
        placeholder='What are your thoughts?'
        minRows={2}
        defaultValue={text}
        onChange={(value) => {
          setText(value.target.value);
        }}
      />
      <div className='panel'>
        <div className='comment_as'>
          Comment as{' '}
          <a href='' className='username'>
            {user}
          </a>
        </div>
        <button onClick={() => handleReply()}>COMMENT</button>
      </div>
    </div>
  );
}

Reply = styled(Reply)`
  border-radius: 8px;
  border: solid 1px #3d4953;
  overflow: hidden;

  &.hidden {
    display: none;
  }

  textarea {
    font-family: inherit;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;

    resize: none;

    background: #13181d;
    padding: 12px;
    color: #cccccc;
    border: none;
    max-width: 100%;
    min-width: 100%;
  }

  .panel {
    display: flex;
    align-items: center;
    background: #3d4953;
    padding: 8px;

    .comment_as {
      font-size: 14px;
      color: #cccccc;
      margin-right: 8px;

      .username {
        display: inline-block;
        color: #4f9eed;
      }
    }

    ${Button} {
      font-size: 14px;
      margin-left: auto;
    }
  }
`;

function Rating(props) {
  const [count, setCount] = useState(props.votes);
  const [thumbsUp, setThumbsUp] = useState(false);
  const [thumbsDown, setThumbsDown] = useState(false);

  return (
    <div {...props}>
      <button
        className={`material-icons ${thumbsUp ? 'selected' : ''}`}
        id='thumbs_up'
        onClick={() => {
          setThumbsUp(!thumbsUp);
          setThumbsDown(false);
        }}
      >
        keyboard_arrow_up
      </button>
      <div
        className={`count ${thumbsUp ? 'up' : ''} ${thumbsDown ? 'down' : ''}`}
      >
        {thumbsUp ? count + 1 : ''}
        {thumbsDown ? count - 1 : ''}
        {thumbsUp || thumbsDown ? '' : count}
      </div>
      <button
        className={`material-icons ${thumbsDown ? 'selected' : ''}`}
        id='thumbs_down'
        onClick={() => {
          setThumbsDown(!thumbsDown);
          setThumbsUp(false);
        }}
      >
        keyboard_arrow_down
      </button>
    </div>
  );
}

Rating = styled(Rating)`
  display: flex;
  flex-direction: column;
  margin-right: 12px;

  .count {
    font-weight: bold;
    text-align: center;
    color: #3d4953;

    &.up {
      color: #4f9eed;
    }

    &.down {
      color: #ed4f4f;
    }
  }

  button#thumbs_up,
  button#thumbs_down {
    border: none;
    background: none;
    cursor: pointer;
    color: #3d4953;

    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
  }

  #thumbs_up.selected {
    color: #4f9eed;
  }

  #thumbs_down.selected {
    color: #ed4f4f;
  }
`;

function Comment(props) {
  const [replying, setReplying] = useContext(CommentContext);
  const [minimized, setMinimized] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(async () => {
    if (props.path.length > 2 && props.path.length % 2 === 0) {
      setHidden(true);
    }
    if (props.path[props.path.length - 1] > 3) {
      setHidden(true);
    }
  }, [props.path]);

  return (
    <div {...props}>
      {hidden ? (
        <button
          id='showMore'
          onClick={() => {
            setHidden(false);
          }}
        >
          Show More Replies
        </button>
      ) : (
        <>
          <div id='left' className={minimized ? 'hidden' : ''}>
            <Rating votes={props.votes} />
          </div>
          <div id='right'>
            <div id='top'>
              <span
                className='minimize'
                onClick={() => {
                  setMinimized(!minimized);
                }}
              >
                [{minimized ? '+' : '-'}]
              </span>
              <span id='username'>
                <a href=''>{props.username}</a>
              </span>
              <span id='date'>
                <a href=''>{props.date}</a>
              </span>
            </div>
            <div id='content' className={minimized ? 'hidden' : ''}>
              <Markdown options={{ forceBlock: true }}>{props.text}</Markdown>
            </div>
            <div id='actions' className={minimized ? 'hidden' : ''}>
              <span
                className={`${compare(replying, props.path) ? 'selected' : ''}`}
                onClick={() => {
                  if (compare(replying, props.path)) {
                    setReplying([]);
                  } else {
                    setReplying(props.path);
                  }
                }}
              >
                reply
              </span>
              <span>report</span>
            </div>
            <Reply
              className={
                compare(replying, props.path) && !minimized ? '' : 'hidden'
              }
              path={props.path}
              // comments={}
            />
            <div className={`comments ${minimized ? 'hidden' : ''}`}>
              {gen_comments(props.comments, props.colorindex + 1, [
                ...props.path,
              ])}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

Comment = styled(Comment)`
  display: flex;
  text-align: left;
  background: ${(props) =>
    props.colorindex % 2 === 0 ? '#161C21' : '#13181D'};
  padding: 16px 16px 16px 12px;
  border: 0.1px solid #3d4953;
  border-radius: 8px;

  #showMore {
    background: none;
    border: none;
    color: #53626f;
    cursor: pointer;
    font-size: 13px;
    text-align: left;

    &:hover {
      text-decoration: underline;
    }
  }

  .comments {
    > * {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0px;
      }
    }

    &.hidden {
      display: none;
    }
  }

  #left {
    text-align: center;
    &.hidden {
      visibility: hidden;
      height: 0;
    }
  }

  #right {
    flex-grow: 1;

    #top {
      .minimize {
        cursor: pointer;
        color: #53626f;

        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
      }

      #username {
        color: #4f9eed;
      }

      #date {
        display: inline-block;
        color: #53626f;
      }

      > * {
        margin-right: 8px;
      }
    }

    #content {
      color: #cccccc;

      &.hidden {
        display: none;
      }
    }

    #actions {
      color: #53626f;
      margin-bottom: 12px;

      -webkit-touch-callout: none; /* iOS Safari */
      -webkit-user-select: none; /* Safari */
      -khtml-user-select: none; /* Konqueror HTML */
      -moz-user-select: none; /* Firefox */
      -ms-user-select: none; /* Internet Explorer/Edge */
      user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */

      &.hidden {
        display: none;
      }

      > .selected {
        font-weight: bold;
      }

      > * {
        cursor: pointer;
        margin-right: 8px;
      }
    }
  }

  ${Reply} {
    margin-bottom: 12px;
  }
`;

//----------------------------------------------------------------------------------------------
//MASTER FUNCTION
//------------------------------------------------------------------------------------------------

const StateContext = React.createContext();
const DispatchContext = React.createContext();

// React.useEffect(() => {
//   async function getComments() {
//     const commentsGet = await firebase.db
//       .collection('postsThreads')
//       .doc('Preventive Medicine')
//       .collection(`comments`)
//       .doc('8f7b1386-0dfc-4036-b8da-e660c656726e')
//       .get();

//     const comment = await commentsGet.data().comments;

//     setComments(comment);
//   }

//   getComments();
// }, []);

let comment = [];
const reducerFunction = (draft, action) => {
  // const commentsMadeObject = { comments: [...action.comments] };

  const { comments } = action;
  debugger;
  switch (action.type) {
    case 'INIT_REDUCER':
      return (draft = action.comment); //sets the initial supply of state and master Comments

    case 'ADD_TO_BASE_COMMENT':
      draft.push(action.payload);
      debugger;
      return draft;

    case 'ADD_COMMENT':
      ////path of update///////////////

      const commentsObject = { comments: [...action.comments] };
      console.log('action.props', action.path);
      let arrayOfArrays = [];
      function splitArray(array) {
        let string = '';
        while (array.length > 0) {
          let arrayElement = array.splice(0, 1);
          string += `[${arrayElement}].comments`;
        }
        return string;
      }

      const deepCloned = cloneDeep(comments);
      const mergedArrayPath = `deepCloned${splitArray(action.path)}`;

      let mergedArrayPathArrayed = [mergedArrayPath];

      mergedArrayPathArrayed.push('hello');

      debugger;
      deepCloned[0].comments[0].comments.push('hello');
      debugger;

      //path of update done/////////////

      //update thed comments with path

      //create object then merge

      debugger;

      // LOng is working with empty object but not with merged

      // const actionWork = set({}, long, 'FUCK YOU');
      // const emptyfa = set({ comments: [] }, long, 'fucl you');

      //thismigth work but

      // const smerged = merge(emptyfa, actionWork);
      debugger;

    // return (draft.comments = smerged);

    default:
      return draft;
  }
};

const curriedReducerFunction = produce(reducerFunction);

function Comments(props) {
  var [replying, setReplying] = useState([]);
  var [comments, setComments] = useState([]);

  const [state, dispatch] = useReducer(curriedReducerFunction, []);

  React.useEffect(() => {
    async function getComments() {
      const commentsGet = await firebase.db
        .collection('postsThreads')
        .doc('Preventive Medicine')
        .collection(`comments`)
        .doc('8f7b1386-0dfc-4036-b8da-e660c656726e')
        .get();

      const comment = await commentsGet.data().comments;

      dispatch({ type: 'INIT_REDUCER', comment });
      setComments(state);
    }

    getComments();
  }, []);

  return (
    <Card {...props}>
      <span id='comments'>Comments</span>
      <span id='comments_count'>(9)</span>
      <DispatchContext.Provider value={dispatch}>
        <StateContext.Provider value={state}>
          <Reply {...props} comment={state} />
          <CommentContext.Provider value={[replying, setReplying]}>
            {gen_comments(state, 0, [])}
          </CommentContext.Provider>
        </StateContext.Provider>
      </DispatchContext.Provider>
    </Card>
  );
}

export default styled(Comments)`
  max-width: 750px;
  min-width: min-content;

  > * {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0px;
    }
  }

  #comments,
  #comments_count {
    font-weight: 900;
    font-size: 20px;
    display: inline-block;
    margin-right: 4px;
    margin-bottom: 8px;
  }

  #comments {
    color: #ffffff;
  }

  #comments_count {
    color: #53626f;
  }
`;
