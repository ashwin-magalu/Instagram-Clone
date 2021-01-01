import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  TextInput,
  Dimensions,
} from "react-native";
import firebase from "firebase";
require("firebase/firestore");
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchUsersData } from "../../redux/actions/index";

function Comment(props) {
  const [comments, setComments] = useState([]);
  const [postId, setPostId] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    function matchUserToComment(comments) {
      for (let i = 0; i < comments.length; i++) {
        //attaching user to all comments, checking whether valid user is commenting
        if (comments[i].hasOwnProperty("user")) {
          // if comments[i] has user property inside it then it will be true, else false
          continue;
        }

        const user = props.users.find((x) => x.uid === comments[i].creator);
        if (user == undefined) {
          props.fetchUsersData(comments[i].creator, false);
        } else {
          comments[i].user = user;
        }
      }
      setComments(comments);
    }

    if (props.route.params.postId !== postId) {
      //to avoid duplications
      firebase
        .firestore()
        .collection("posts")
        .doc(props.route.params.uid)
        .collection("userPosts")
        .doc(props.route.params.postId)
        .collection("comments")
        .get()
        .then((snapshot) => {
          let comments = snapshot.docs.map((doc) => {
            const data = doc.data();
            const id = doc.id;
            return { id, ...data };
          });
          matchUserToComment(comments);
        });
      setPostId(props.route.params.postId);
    } else {
      matchUserToComment(comments);
    }
  }, [props.route.params.postId, props.users]);

  const onCommentSend = () => {
    firebase
      .firestore()
      .collection("posts")
      .doc(props.route.params.uid)
      .collection("userPosts")
      .doc(props.route.params.postId)
      .collection("comments")
      .add({
        creator: firebase.auth().currentUser.uid,
        text,
      });
  };

  return (
    <View>
      <FlatList
        numColumns={1}
        horizontal={false}
        data={comments}
        renderItem={({ item }) => (
          <View
            style={{
              width: Dimensions.get("screen").width,
              height: Dimensions.get("screen").height / 1.5,
              margin: 2,
              justifyContent: "center",
            }}
          >
            {item.user !== undefined ? (
              <Text style={{ fontSize: 22 }}>{item.user.name}</Text>
            ) : (
              <Text style={{ fontSize: 22 }}>User xyz</Text>
            )}
            <Text style={{ fontSize: 18 }}>{item.text}</Text>
          </View>
        )}
      />

      <View>
        <TextInput
          style={{ fontSize: 18 }}
          placeholder="Add comment..."
          onChangeText={(text) => setText(text)}
        />
        <Button onPress={() => onCommentSend()} title="Send" />
      </View>
    </View>
  );
}

const mapStateToProps = (store) => ({
  users: store.usersState.users,
});
const mapDispatchProps = (dispatch) =>
  bindActionCreators({ fetchUsersData }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Comment);
