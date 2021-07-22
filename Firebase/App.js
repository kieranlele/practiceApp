import 'react-native-gesture-handler';
import {View, Image} from 'react-native';
import React, { useEffect, useState,useReducer } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { LoginScreen, HomeScreen, RegistrationScreen, ChatLoadingScreen, ChatScreen } from './src/screens'
import {decode, encode} from 'base-64'
import { firebase } from './src/firebase/config';
import * as SplashScreen from 'expo-splash-screen';
import { AuthContext, UserContext,ChatContext } from './src/contexts/Context';
import * as authMethods from './src/firebase/authMethods'
if (!global.btoa) {  global.btoa = encode } // no clue what these do. Encrypt info sent to firebase?
if (!global.atob) { global.atob = decode }

const Stack = createStackNavigator();

//I'll try to understand this code, taken from the docs.

export default function App({ navigation }) {
    
    const [user, setUser] = useState(null);
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
              loading: true, //maybe delete this?
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
      //useMemo does difficult calculations once whenever something changes rather than doing them on every render. 
      //we pass the memoized functions to other components as context
      () => ({
        signIn: async (email,password) => {
          // In a production app, we need to send some data (usually username, password) to server and get a token
          // We will also need to handle errors if sign in failed
          // After getting token, we need to persist the token using `SecureStore`
          // In the example, we'll use a dummy token

         setUser(authMethods.signIn(email,password));
         dispatch({ type: 'SIGN_IN'});
        },
        //signOut is not async because we don't have to communicate with a server to deny a user access to the app (I think)
        signOut: () => {
          setUser(authMethods.signOut);
          dispatch({ type: 'SIGN_OUT' })
        },
        signUp: async (fullName, email, password) => { // these comments came with the code. 
          // In a production app, we need to send user data to server and get a token
          // We will also need to handle errors if sign up failed
          // After getting token, we need to persist the token using `SecureStore`
          // In the example, we'll use a dummy token
          setUser(authMethods.signUp(fullName, email, password));
          dispatch({ type: 'SIGN_IN'});
        },
      }),
      []
    );
    function prepare() {
    const usersRef = firebase.firestore().collection('users'); // defines the Firebase collection that we fetch our data from.
    firebase.auth().onAuthStateChanged(user => {
      if (user) { //If the user exists and has been defined already. The very first time this code runs, this should be false.
        usersRef
          .doc(user.uid) //I believe this command searches the database using this particular field. 
          .get() //.get returns a promise
          .then((document) => {
            const userData = document.data() // this is an object
            console.log(userData);
            dispatch({type:'RESTORE_TOKEN'}) //once the data has been received, the screen is no longer loading. A splash screen should be used pre-loading.
            setUser(userData)
          })
          .catch((error) => { 
            dispatch({type:'RESTORE_TOKEN'}) // in the event of an error, just default to the start screen with user still being null
            alert("Error loading user");
            console.log("Error"+error);
          });
      } else {
        dispatch({type:'RESTORE_TOKEN'}) // defaults to the start screen without having a defined user.
      }
    });
    }
    useEffect(() => { prepare()} , []); 
    if(state.loading){
      return( 
        <View>
          <Image source = {require('./assets/favicon.png')}/> 
        </View>
      )
    };

    return (
      //The provider enables us to adjust the state variables of App.js from inside the different screens for the navigator auth-flow.
      <AuthContext.Provider value = {authContext}>
        <UserContext.Provider value = {user}>
         <NavigationContainer>
            <Stack.Navigator>
                { Boolean(user) ? ( // The below {props} syntax made little sense to me. Refer to https://reactnavigation.org/docs/hello-react-navigation/#passing-additional-props
                      // Essentially, we just add another prop to be passed along with navigation and route. It's supposedly better to use context though.
                   <>
                  <Stack.Screen name="Home" component = {HomeScreen}/> 
                  {/* {props => <HomeScreen{...props} extraData={user} />}  </Stack.Screen>  */}
                    <Stack.Screen name = "ChatLoadingScreen" component = {ChatLoadingScreen} />
                    <Stack.Screen name = "Chat Screen" component = {ChatScreen} />
                  
                  </>
                ) : ( // Note that the {user ? (code) :(other code) is a ternary operator. I think it saves the user from having to repeat logins}
                <>
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Registration" component={RegistrationScreen} />
                </>
                 )}
             </Stack.Navigator>
          </NavigationContainer>
       </UserContext.Provider>
      </AuthContext.Provider>
    );
  }