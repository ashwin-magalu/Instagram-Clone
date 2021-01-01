import React, { Component } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LandingScreen from "./components/auth/Landing";
import * as firebase from "firebase";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import MainScreen from "./components/Main";
import { Text, View } from "react-native";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import rootReducer from "./redux/reducers";
import thunk from "redux-thunk";
import AddScreen from "./components/main/Add";
import SaveScreen from "./components/main/Save";
import CommentScreen from "./components/main/Comment";

const firebaseConfig = {
  apiKey: "AIzaSyAV-IUGEVe3QW3_y4J8ee20dd-Id7Q1A1U",
  authDomain: "react-native-proj.firebaseapp.com",
  databaseURL: "https://react-native-proj.firebaseio.com",
  projectId: "react-native-proj",
  storageBucket: "react-native-proj.appspot.com",
  messagingSenderId: "73660650526",
  appId: "1:736606509526:web:e48d52045d466f2b86c77",
  measurementId: "G-Z2754JJNL",
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

const Stack = createStackNavigator();

const store = createStore(rootReducer, applyMiddleware(thunk));

class App extends Component {
  constructor(props) {
    super();
    this.state = {
      loaded: false,
    };
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        this.setState({
          loggedIn: false,
          loaded: true,
        });
      } else {
        this.setState({
          loggedIn: true,
          loaded: true,
        });
      }
    });
  }

  render() {
    const { loggedIn, loaded } = this.state;
    if (!loaded) {
      return (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text>Loading</Text>
        </View>
      );
    }

    if (!loggedIn) {
      return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Landing">
            <Stack.Screen
              name="Landing"
              component={LandingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Login" component={Login} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }

    return (
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Main">
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen
              name="Comment"
              component={CommentScreen}
              navigation={this.props.navigation}
            />
            <Stack.Screen
              name="Add"
              component={AddScreen}
              navigation={this.props.navigation}
            />
            <Stack.Screen
              name="Save"
              component={SaveScreen}
              navigation={this.props.navigation}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    );
  }
}

export default App;
