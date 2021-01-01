import React, { useState } from "react";
import { View, Button, TextInput } from "react-native";
import firebase from "firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSignIn = () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err.message));
  };

  return (
    <View>
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
      <Button title="Sign In" onPress={() => onSignIn()} />
    </View>
  );
}
