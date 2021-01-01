import React, { useState } from "react";
import { View, Button, TextInput } from "react-native";
import firebase from "firebase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const onSignUp = () => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((res) => {
        firebase
          .firestore()
          .collection("instagram-users")
          .doc(firebase.auth().currentUser.uid)
          .set({
            name: name,
            email: email,
          });
      })
      .catch((err) => console.log(err.message));
  };

  return (
    <View>
      <TextInput
        placeholder="Enter user name"
        onChangeText={(name) => setName(name)}
        value={name}
      />
      <TextInput
        placeholder="Enter email"
        onChangeText={(email) => setEmail(email)}
        value={email}
      />
      <TextInput
        placeholder="Enter password"
        onChangeText={(pass) => setPassword(pass)}
        value={password}
        secureTextEntry={true}
      />
      <Button title="Sign Up" onPress={() => onSignUp()} />
    </View>
  );
}
