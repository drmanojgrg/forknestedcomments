import React from 'react';
import firebase from '../../firebase';

import chapterlist from '../chapterlist';

function useAuth() {
  const [authUser, setAuthUser] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = firebase.auth.onAuthStateChanged(async (user) => {
      if (user) {
        //supplied to all components in APP const user= retur this function
        //not created in database
        setAuthUser({
          name: user.displayName,
          image: user.providerData[0].photoURL,
          email: user.email,
          uid: user.uid,
        });
      } else {
        setAuthUser(null);
      }
    });

    return () => unsubscribe(); //so that it doesn't start now
  }, []);
  //is this going to rewrite too much
  return authUser;
}

export default useAuth; //usedd in App.js
