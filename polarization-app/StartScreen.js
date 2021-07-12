import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Pressable} from 'react-native';
import { NavigationContainer, TabRouter, useNavigation } from '@react-navigation/native';
import { RegistrationScreen } from './registrationScreen';
import { LoginScreen } from './loginScreen';
import {HomeScreen} from './homeScreen';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

/*
Every screen in a navigator gets passed two props automatically. A route prop containing route information 
and parameters passed from a previous screen, and a navigation prop that lets you navigate and pass parameters to 
different screens. They do a lot more as well, and I recommend reading the react-navigation docs thoroughly. The codecademy course
does not do navigators justice.
*/
export const StartScreen = ({navigation, route}) =>{
  const [credential, setCredential] = useState({username: 'Guest', password:''});
  const [validCredentials, setValidCredentials] = useState([]);
    /*
    Clicking on Login will take you to the login screen, where users will go through a user authentication process. Username (state or prop?) is set to *username*
    Clicking on Registration will take you to the registration screen, where users will create an account
    Clicking on Guest will take you to a main menu where some of the features are hidden. Guest username (a state variable ?or prop?) is set to guest
    */
   useEffect(()=> { // this code needs to be handled asynchronously only when route.params.validCredentials changes. So, we call it in this hook.
     /*
     The question mark in the prop path below has a purpose. 
     It tells react not to throw an exception if route.params doesn't exist. 
     Instead, react will give it a falsy value and go to else.

     If we didn't have it, the app would fail every time it ran. 
     */
     if(route.params?.validCredentials){ 
        setValidCredentials(route.params?.validCredentials); //we can call setValidCredentials in a useEffect hook.
     }
     else{
      alert("No credentials returned")
     }
   }, [route.params?.validCredentials]); //Only run when route.params.validCredentials changes.

   const nav = useNavigation();
    return (        
      <View style = {styles.container}>
           <View style = {styles.loginContainer}>
             <LoginButton label="Login" nav = {nav} validCredentials = {validCredentials}/> 
             <RegistrationButton label = "Register" nav = {nav} validCredentials = {validCredentials}/>
             <LoginButton label = "Guest" nav = {nav}/>
           </View>
       </View> 
      );
    }
     /*A problem with this code
      is that Guest and Home both direct to the same screen. When you arrive, the top left corner may display "guest" if you 
      clicked on Guest to get there. */
  export const StartScreenNavigator =() =>{
    return (
    <Stack.Navigator>
      <Stack.Screen name = "Start" component = {StartScreen}/>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name = "Register" component = {RegistrationScreen} />
      <Stack.Screen name = "Guest" component = {HomeScreen}/> 
      <Stack.Screen name = "Home" component = {HomeScreen}/>
  </Stack.Navigator>
   ) } 
  const LoginButton = (props) =>{
    
      return(
        <Pressable style = {styles.loginButton} onPress = {() => //use pressable rather than button for most things.
        props.nav.navigate(props.label, //nav has to be passed as a prop so we can define the onPress behavior. 
        {validCredentials: props.validCredentials})}>
           <Text style = {styles.buttonText}>{props.label}</Text> 
        </Pressable>    
      )
      }
  const RegistrationButton = (props) => { // I think this is exactly the same as the LoginButton. I didn't know it would be going into things
    return(
      <Pressable style = {styles.loginButton} onPress = {() => 
        props.nav.navigate(props.label, {
         validCredentials: props.validCredentials})}>
         <Text style = {styles.buttonText}>{props.label}</Text> 
      </Pressable>    
    )
    }
  

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#000099',
        alignItems: 'center',
        justifyContent: 'center',
      },
      loginContainer: {
        width: "50%",
        height: "50%",
        alignItems: "center",
        justifyContent: "space-evenly",
      },
      loginButton: {
        height: "30%",
        width: "100%",
        backgroundColor: "#cce6ff",
        alignItems: 'center',
        justifyContent: 'center',
      },
      buttonText: {
        fontSize: 30,
        fontWeight: "bold",
        fontFamily: "Helvetica"
      }
    });


