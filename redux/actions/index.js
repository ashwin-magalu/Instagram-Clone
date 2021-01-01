import firebase from "firebase";
import {
  CLEAR_DATA,
  USERS_DATA_STATE_CHANGE,
  USERS_LIKES_STATE_CHANGE,
  USERS_POSTS_STATE_CHANGE,
  USER_FOLLOWING_STATE_CHANGE,
  USER_POSTS_STATE_CHANGE,
  USER_STATE_CHANGE,
} from "../constants";
require("firebase/firestore");

export function clearData() {
  return (dispatch) => {
    dispatch({ type: CLEAR_DATA });
  };
}

export function fetchUser() {
  return (dispatch) => {
    firebase
      .firestore()
      .collection("instagram-users")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((snap) => {
        if (snap.exists) {
          // fetching data from DB
          console.log(snap);
          dispatch({ type: USER_STATE_CHANGE, currentUser: snap.data() });
          //Sending data to Reducer for updation
        } else {
          console.log("Document does not exist");
        }
      });
  };
}

export function fetchUserPosts() {
  return (dispatch) => {
    firebase
      .firestore()
      .collection("posts")
      .doc(firebase.auth().currentUser.uid)
      .collection("userPosts")
      .orderBy("creation", "desc")
      .get()
      .then((snapshot) => {
        let posts = snapshot.docs.map((doc) => {
          const data = doc.data();
          const id = doc.id;
          return { id, ...data };
        });
        dispatch({ type: USER_POSTS_STATE_CHANGE, posts });
      });
  };
}

export function fetchUserFollowing() {
  return (dispatch) => {
    firebase
      .firestore()
      .collection("instagram-following")
      .doc(firebase.auth().currentUser.uid)
      .collection("userFollowing")
      .onSnapshot((snapshot) => {
        let following = snapshot.docs.map((doc) => {
          const id = doc.id;
          return id;
        });
        dispatch({ type: USER_FOLLOWING_STATE_CHANGE, following });
        for (let i = 0; i < following.length; i++) {
          dispatch(fetchUsersData(following[i], true));
        }
      });
  };
}

export function fetchUsersData(uid, getPosts) {
  //fetches the data of users we follow
  return (dispatch, getState) => {
    const found = getState().usersState.users.some((el) => el.uid === uid);
    // Avoids duplication
    if (!found) {
      //User does not exists within our users list
      firebase
        .firestore()
        .collection("instagram-users")
        .doc(uid)
        .get()
        .then((snapshot) => {
          if (snapshot.exists) {
            let user = snapshot.data();
            user.uid = snapshot.id;

            dispatch({ type: USERS_DATA_STATE_CHANGE, user });
          } else {
            console.log("does not exist");
          }
        });
      if (getPosts) {
        dispatch(fetchUsersFollowingPosts(uid));
      }
    }
  };
}

export function fetchUsersFollowingPosts(uid) {
  return (dispatch, getState) => {
    firebase
      .firestore()
      .collection("posts")
      .doc(uid)
      .collection("userPosts")
      .orderBy("creation", "desc")
      .get()
      .then((snapshot) => {
        const uid = snapshot.query.EP.path.segments[1];
        // we lose the value of uid as this is in sync loop, so we get uid in this way, by looking at logs of snapshot
        const user = getState().usersState.users.find((el) => el.uid === uid);
        //Finds user from users list

        let posts = snapshot.docs.map((doc) => {
          const data = doc.data();
          const id = doc.id;
          return { id, ...data, user };
        });

        for (let i = 0; i < posts.length; i++) {
          dispatch(fetchUsersFollowingLikes(uid, posts[i].id));
        }
        dispatch({ type: USERS_POSTS_STATE_CHANGE, posts, uid });
      });
  };
}

export function fetchUsersFollowingLikes(uid, postId) {
  return (dispatch, getState) => {
    firebase
      .firestore()
      .collection("posts")
      .doc(uid)
      .collection("userPosts")
      .doc(postId)
      .collection("likes")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((snapshot) => {
        const postId = snapshot.ZE.path.segments[3];
        // we lose the value of postID as this is in sync loop, so we get uid in this way, by looking at logs of snapshot

        let currentUserLike = false;
        if (snapshot.exists) {
          currentUserLike = true;
        }

        dispatch({ type: USERS_LIKES_STATE_CHANGE, postId, currentUserLike });
      });
  };
}
