import 'react-native-gesture-handler';
import {View, Image} from 'react-native';
import React, { useEffect, useState,useReducer, createContext } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { LoginScreen, HomeScreen, RegistrationScreen } from './src/screens'
import {decode, encode} from 'base-64'
import { firebase } from './src/firebase/config';
import * as SplashScreen from 'expo-splash-screen';
//import * as SecureStore from 'expo-secure-store';
if (!global.btoa) {  global.btoa = encode }
if (!global.atob) { global.atob = decode }

const Stack = createStackNavigator();
const [user, setUser] = useState(null);
const AuthContext = createContext();
//I'll try to understand this code, taken from the docs.
export default function App({ navigation }) {
    const [state, dispatch] = useReducer(  //useReducer takes two parameters, a reducer (defined in our program) and an initial state
      //useReducer is preferable when the next state depends on the previous one or when state logic is complex
      (prevState, action) => { //our reducer starts here
        switch (action.type) {
          case 'RESTORE_TOKEN': //when restore token is passed to the dispatch function 
            return {
              ...prevState, // get the values from the previous state object - we probably just signed out
              loading: false, //stop loading.
            };
          case 'SIGN_IN': //when we sign in
            return {
              ...prevState,
              signout: false, //we aren't signing out
            };
          case 'SIGN_OUT': // when we sign out
            return {
              ...prevState,
              signout: true, //sign us out
            };
        }
      },
      {//our initial state here. 
        loading: true,
        signout: false,
        //the original code had a userToken state variable that held the value of an authentication token stored on the user device
      }
    );
    const authContext = React.useMemo(//https://blog.agney.dev/useMemo-inside-context/ I found this in the auth-flow docs, but 
      //I don't understand how useMemo creates context. I don't really understand how useMemo works right now. I think it just does 
      //difficult calculations once whenever something changes rather than doing them on every render. 
      () => ({
        signIn: async (email,password) => {
          // In a production app, we need to send some data (usually username, password) to server and get a token
          // We will also need to handle errors if sign in failed
          // After getting token, we need to persist the token using `SecureStore`
          // In the example, we'll use a dummy token
          firebase
          .auth()
          .signInWithEmailAndPassword(data.email, data.password)
          .then((response) => {
            const uid = response.user.uid
            const usersRef = firebase.firestore().collection('users')
            usersRef
              .doc(uid)
              .get()
              .then(firestoreDocument => {
                if (!firestoreDocument.exists) {
                  alert("User does not exist anymore.")
                  return;
                }
                const userData = firestoreDocument.data()
                setUser(userData)
              })
              .catch(error => {
                alert(error)
              });
          })
          .catch(error => {
            alert(error)
          })
  
          dispatch({ type: 'SIGN_IN'});
        },
        //signOut is not async because we don't have to communicate with a server to deny a user access to the app (I think)
        signOut: () => {
          firebase
        .signOut()
        .then(() => {
          setUser(null)
        })
        .catch((error) => {
          alert(error)
        })
          dispatch({ type: 'SIGN_OUT' })
        },
        signUp: async (email, password) => { // these comments came with the code. 
          // In a production app, we need to send user data to server and get a token
          // We will also need to handle errors if sign up failed
          // After getting token, we need to persist the token using `SecureStore`
          // In the example, we'll use a dummy token
          firebase
          .auth()
          .createUserWithEmailAndPassword(data.email, data.password)
          .then((response) => {
            const uid = response.user.uid
            const userData = {
              id: uid,
              email: data.email,
              fullName: data.fullName,
            };
            const usersRef = firebase.firestore().collection('users')
            usersRef
              .doc(uid)
              .set(userData)
              .then(() => {
                setUser(userData)
              })
              .catch((error) => {
                alert(error)
              });
          })
          .catch((error) => {
            alert(error)
          });
          dispatch({ type: 'SIGN_IN'});
        },
      }),
      []
    );
    useEffect(() => {
      async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        await SplashScreen.preventAutoHideAsync();
        await new Promise((resolve=> setTimeout(resolve, 3000)));
        await SplashScreen.hideAsync();
      }catch(error){
        alert(error);
      }
    const usersRef = firebase.firestore().collection('users'); // defines the Firebase collection that we fetch our data from.
    firebase.auth().onAuthStateChanged(user => {
      if (user) { //If the user exists and has been defined already. The very first time this code runs, this should be false. 
        usersRef
          .doc(user.uid) //I believe this command searches the database using this particular field. 
          .get() //.get returns a promise
          .then((document) => {
            const userData = document.data() // this is an object
            dispatch({type:'RESTORE_TOKEN'}) //once the data has been received, the screen is no longer loading. A splash screen should be used pre-loading.
            setUser(userData)
          })
          .catch((error) => { 
            dispatch({type:'RESTORE_TOKEN'}) // in the event of an error, just default to the start screen with user still being null
            alert("Error loading user");
          });
      } else {
        dispatch({type:'RESTORE_TOKEN'}) // defaults to the start screen without having a defined user.
      }
    });
    }

  prepare();} , []); 
    if(state.loading){
      return( // the splash screen should be implemented here. 
        <View>
          <Image source = {require('./assets/favicon.png')}/>
        </View>
      )
    };
    return (
      //The code below is bad. It does not follow proper authentication flow with react navigation.
    //Refer to https://reactnavigation.org/docs/auth-flow/ for details
    // and to https://github.com/tpssim/react-native-firebase for a complete solution using correct auth-flow.
    //Note that the second link also provides an example of React.Context, which is considered the proper way
    // to pass an extra prop to a screen. 
    <AuthContext.Provider value = {authContext}>
      <NavigationContainer>
        <Stack.Navigator>
          { user ? ( // The below {props} syntax made little sense to me. Refer to https://reactnavigation.org/docs/hello-react-navigation/#passing-additional-props
                      // Essentially, we just add another prop to be passed along with navigation and route  
            <Stack.Screen name="Home">
              {props => <HomeScreen{...props} extraData={user} />} 
            </Stack.Screen>
          ) : ( // Note that the {user ? (code) :(other code) is a ternary operator. I think it saves the user from having to repeat logins}
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Registration" component={RegistrationScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      </AuthContext.Provider>
    );
  }