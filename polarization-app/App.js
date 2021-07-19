import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StartScreenNavigator  } from './StartScreen';
import { NavigationContainer } from '@react-navigation/native';

//TODO: ADD PROPTYPES
/*
I think that the typical procedure is to store all of the valid login information on a server
And to keep all the user information on that server too.
To allow for offline use of some features, an authentication token can be stored on the users device.
The user authentication I use in this app isn't real. It's more of an exercise in passing props around than anything else.
*/

 export default function App() { 
  /*
  My first deviation from good code standards occurs here, I think. All navigators should be created in the App.js file. 
  I created the StartScreenNavigator in a different file. 
  Note: NavigationContainer should always be the top element. If you contain it in a <View> things get annoying and weird in my experience.
  */
  return (
    <NavigationContainer> 
      <StatusBar style="auto" />     
             <StartScreenNavigator /> 
    </NavigationContainer>
  );
}
// Something that I found really annoying is that I couldn't figure out how to use a debugger with react native code. 
// If someone can find a solution, that would be amazing.