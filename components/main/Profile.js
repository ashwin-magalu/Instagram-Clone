import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  Button,
  Dimensions,
} from "react-native";
import firebase from "firebase";
require("firebase/firestore");
import { connect } from "react-redux";
import { TouchableOpacity } from "react-native-gesture-handler";

function Profile(props) {
  const [userPosts, setUserPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const { currentUser, posts } = props;

    if (props.route.params.uid === firebase.auth().currentUser.uid) {
      /* User seeing his own profile */
      setUser(currentUser);
      setUserPosts(posts);
    } else {
      /* Someone else seeing user's profile */
      firebase
        .firestore()
        .collection("instagram-users")
        .doc(props.route.params.uid)
        .get()
        .then((snapshot) => {
          if (snapshot.exists) {
            setUser(snapshot.data());
          } else {
            console.log("does not exist");
          }
        });

      firebase
        .firestore()
        .collection("posts")
        .doc(props.route.params.uid)
        .collection("userPosts")
        .orderBy("creation", "desc")
        .get()
        .then((snapshot) => {
          let posts = snapshot.docs.map((doc) => {
            const data = doc.data();
            const id = doc.id;
            return { id, ...data };
          });
          setUserPosts(posts);
        });
    }

    if (props.following.indexOf(props.route.params.uid) > -1) {
      //Checking whether I'm following that user or not, by checking whether this user id is there in my following list
      //props.following is coming from reducer, it is not following hook we created here
      setFollowing(true);
    } else {
      setFollowing(false);
    }
  }, [props.route.params.uid, props.following]);

  const onFollow = () => {
    firebase
      .firestore()
      .collection("instagram-following")
      .doc(firebase.auth().currentUser.uid) //myID
      .collection("userFollowing")
      .doc(props.route.params.uid) //Whom I'm following, their ID
      .set({});
  };

  const onUnfollow = () => {
    firebase
      .firestore()
      .collection("instagram-following")
      .doc(firebase.auth().currentUser.uid)
      .collection("userFollowing")
      .doc(props.route.params.uid)
      .delete();
  };

  const onLogout = () => {
    firebase.auth().signOut();
  };

  if (user === null) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        <Text>{user.name}</Text>
        <Text>{user.email}</Text>

        {props.route.params.uid !== firebase.auth().currentUser.uid ? (
          <View>
            {following ? (
              <Button title="Following" onPress={() => onUnfollow()} />
            ) : (
              <Button title="Follow" onPress={() => onFollow()} />
            )}
          </View>
        ) : (
          <Button title="Logout" onPress={() => onLogout()} />
        )}
      </View>

      <View style={styles.containerGallery}>
        <Text>Posts</Text>
        <View style={{ flex: 1 }}>
          <FlatList
            numColumns={3}
            horizontal={false} // not a horizontal scroll
            data={userPosts}
            style={{
              width: Dimensions.get("screen").width,
            }}
            renderItem={({ item }) => (
              <TouchableOpacity>
                <View
                  style={{
                    width: Dimensions.get("screen").width / 3 - 4,
                    height: Dimensions.get("screen").width / 3 - 4,
                    margin: 2,
                    justifyContent: "center",
                  }}
                >
                  <Image
                    style={{
                      flex: 1,
                      zIndex: 99,
                      borderRadius: 20,
                      borderColor: "white",
                      borderWidth: 2,
                      backgroundColor: "white",
                    }}
                    resizeMode="contain"
                    source={{ uri: item.downloadURL }}
                  />
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => item.id}
            initialNumToRender={userPosts.length}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerInfo: {
    margin: 20,
  },
  containerGallery: {
    flex: 1,
    width: 100,
  },
  containerImage: {
    flex: 1,
  },
  image: {
    flex: 1 / 3,
    aspectRatio: 1 / 1,
  },
});

const mapStateToProps = (store) => ({
  //fetching user data from reducer
  currentUser: store.userState.currentUser,
  posts: store.userState.posts,
  following: store.userState.following,
});

export default connect(mapStateToProps, null)(Profile);
