import React, {useState} from 'react';
import { StyleSheet, Text, View, TextInput, Button} from 'react-native';


export const LoginScreen = function({navigation, route}){
  const validCredentials = route.params.validCredentials; //passed from the start screen. 
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState(''); // The actual username and password of our user is not passed to any other screen.
                                                      // That's just fine in this practice project, but it'd be rather foolish in the real world.
  let isValid = false;

  const  handleUsernameInput = (username) =>{ // stores the registered username in a state variable until we're ready to use it
    let name = username.nativeEvent.text;
    setNewName(name);
  }
  const handlePasswordInput = (password) => { // stores the password in a state variable until we are ready to use it
    
    let pass = password.nativeEvent.text;
    setNewPassword(pass);
    
  }
  const validateInputs = () =>{
    validCredentials.forEach(credential =>{
      if(credential.username === newName && credential.password === newPassword){
        isValid = true;
        navigation.navigate("Home");
      }
    })
    
   // alert(isValid);
  }

  return(
  <View style = {styles.container}>
        <EntryField fieldLabel = "Username:" inputhandler = {handleUsernameInput} />
        <EntryField fieldLabel = "Password:" inputhandler = {handlePasswordInput} />
        <Button title ='Tap for Login' onPress = {validateInputs}>Login</Button>
  </View>
  )
};


const EntryField = function(props){ 
  return(
    <View style = {styles.textContainer}>
    <View style = {styles.textBox}>
        <Text style = {styles.text}>{props.fieldLabel}</Text>
    </View>
        <TextInput onSubmitEditing = {props.inputhandler} 
        style = {styles.textInputBox}></TextInput>
    
</View>
)};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000099',
    alignItems: 'center',
    justifyContent: 'center',
  },  
    textContainer: {
      width: "40%",
      height: "20%",
      alignItems: "center",
      justifyContent: "space-evenly",
      
    },
    textBox: {
      height: "35%",
      width: "100%",
      backgroundColor: "#cce6ff",
      alignItems: 'center',
      justifyContent: 'center',
      
    },
    textInputBox: {
      width: "100%",
      height: "35%",
      padding: 8,
      backgroundColor: "#cce6ff"
    }
  });