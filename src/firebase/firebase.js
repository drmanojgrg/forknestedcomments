import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

import firebaseConfig from './config';

class Firebase {
  constructor() {
    app.initializeApp(firebaseConfig);
    this.auth = app.auth();
    this.firestore = app.firestore;
    this.db = app.firestore();
    this.functions = app.functions();
    this.provider = new app.auth.GoogleAuthProvider();
    this.facebookProvider = new app.auth.FacebookAuthProvider();
  }
  ynar;
  async register(name, email, password) {
    const newUser = await this.auth.createUserWithEmailAndPassword(
      email,
      password
    );
    return await newUser.user.updateProfile({
      displayName: name,
    });
  }

  signInWithGoogle = () => {
    this.auth
      .signInWithPopup(this.provider)
      .then((res) => {
        console.log(res.user);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }; //these are all hooks inside t

  signInWithFacebook = () => {
    this.auth
      .signInWithPopup(this.facebookProvider)
      .then((res) => {
        console.log(res.user);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  async login(email, password) {
    return await this.auth.signInWithEmailAndPassword(email, password);
  }

  async logout() {
    await this.auth.signOut();
  }

  async resetPassword(email) {
    await this.auth.sendPasswordResetEmail(email);
  }
}

const firebase = new Firebase();

export default firebase;
