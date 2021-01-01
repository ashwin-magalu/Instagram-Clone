import React, { useState } from "react";
import { View, TextInput, Image, Button } from "react-native";
import firebase from "firebase";
require("firebase/firestore");
require("firebase/firebase-storage");

export default function Save(props) {
  //console.log(props)
  const [caption, setCaption] = useState("");

  const uploadImage = async () => {
    const uri = props.route.params.image;
    const childPath = `posts/${
      firebase.auth().currentUser.uid
    }/${Math.random().toString(36)}`;
    // Creating an unique file name, 36 is the base of the string here and saving it in a posts folder, which will have a separate folder with users uid as folder name
    //console.log(childPath);

    const response = await fetch(uri); //fetches raw image uri
    const blob = await response.blob(); //creates a blob of image uri for uploading

    const task = firebase.storage().ref().child(childPath).put(blob);
    // uploading image to firebase storage

    const taskProgress = (snapshot) => {
      console.log(`transferred: ${snapshot.bytesTransferred}`);
    };

    const taskCompleted = () => {
      //getting uploaded image's downloadURL
      task.snapshot.ref.getDownloadURL().then((snapshot) => {
        savePostData(snapshot);
        //console.log(snapshot);
      });
    };

    const taskError = (snapshot) => {
      console.log(snapshot);
    };

    task.on("state_changed", taskProgress, taskError, taskCompleted);
    // calling above 3 functions one by one in an order
  };

  const savePostData = (downloadURL) => {
    firebase
      .firestore()
      .collection("posts")
      .doc(firebase.auth().currentUser.uid)
      .collection("userPosts")
      .add({
        downloadURL,
        caption,
        likesCount: 0,
        creation: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(function () {
        props.navigation.popToTop();
        // This will take us to beginning route of our navigator, in this case, it is MainPage
      });
  };
  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri: props.route.params.image }} />
      <TextInput
        placeholder="Write a Caption . . ."
        onChangeText={(caption) => setCaption(caption)}
      />

      <Button title="Post" onPress={() => uploadImage()} />
    </View>
  );
}
