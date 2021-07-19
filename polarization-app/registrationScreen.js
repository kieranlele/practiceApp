import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, TextInput,Button} from 'react-native';
//TODO: 

/*
The user will register a name, which will be stored in a state variable
Then, they will register a password, which will be stored in a state variable

If the username does not match any other, and the passwords match, the username and password will be accepted as valid login credentials in the future
//The array of valid login credentials will be passed as a prop to login

*/
export const RegistrationScreen = function({navigation, route}){
  const credentialList = route.params.validCredentials; 
  const [newName, setNewName] = useState();
  const [newPassword, setNewPassword] = useState(); // I think its fine having newName and newPassword as state variables. 
  const [validCredentials, setValidCredentials] = useState(credentialList); 
  let validated;

  const  handleUsernameInput = (username) =>{ // stores the registered username in a state variable until we're ready to use it
    /*
   username is an object that stores the information of the actual event. We just want the value
   someone on stackExchange recommended using let name = username.target.value; This only worked for me in a simulator on the web.
   What I have is the correct way to store the value of the textInput event to the best of my knowledge.  
    */
   /*
    Something extremely important that messed me up for quite a bit is that useState() and the other hooks are asynchronous.
    I don't remember it being explained in the Codecademy course, but this is the reason why useState(), useEffect(), and other hooks
    must be called at the top level. In order to run through the aynchronous queries created by the hooks in the same order each render, hooks
    should only be called at the top level or inside other hooks.
    
    I ran into a problem because of this below with handleVerifyPassword.
   */
    let name = username.nativeEvent.text;  
    setNewName(name);
    alert(name); // for debug purposes
  }
  const handlePasswordInput = (password) => { // stores the password in a state variable until we are ready to use it
    let pass = password.nativeEvent.text;
    setNewPassword(pass);
    alert(pass); // also for debug purposes.
    
  }
  const handleVerifyPassword = (password) =>{ // Verifies that the username is not taken, checks that the password is consistent
    let pass = password.nativeEvent.text;
    let nameIsNew = true;
    let passwordsMatch = true;
    //Logic to determine if username is unique
   // alert(newName + newPassword);
    validCredentials.forEach(credential => {
      if(credential.username === newName){
        nameIsNew = false;
        alert("Username taken");
      }
    })
    //logic to determine if passwords are consistent
    if(pass != newPassword){
      passwordsMatch = false;
      alert(newPassword + pass);
    } 
    if(nameIsNew && passwordsMatch){
      validated = true;
     alert(validated);
    }
    if(validated){  
      const newCredential = { // creates a new Credential object
        username: newName,
        password: newPassword,
      }

      setValidCredentials((prev)=>[...prev, newCredential]);
  }
}
      /*
      You'll notice that I have a validateEntries function below called only by my button component.
      As you can see, it doesn't actually validate anything. All that occurs above in the handleVerifyPassword function.
      The reason is that I was trying to call navigation.navigate("Start") immediately after setValidCredentials.
      Because setValidCredentials is asynchronous, it didn't leave enough time for the change in the validCredentials state 
      to take effect. So, navigation.navigate kept sending an undefined object to the start screen.

      Having the user click a button to navigate gives the asynchronous function the time it needs to work.
      */
  const validateEntries = () =>{
    navigation.navigate("Start", {validCredentials: validCredentials})
}
  
  
  return(
    <View style = {styles.container}>
        <EntryField fieldLabel = "Username:" handler = {handleUsernameInput}/>
        <EntryField fieldLabel = "Password:" handler = {handlePasswordInput}/>
        <EntryField fieldLabel = "Verify Password:" handler = {handleVerifyPassword}/>
        <Button title = 'Tap for Registration' onPress = {validateEntries}/>
    </View>

  )
};

const EntryField = function(props){
  return(
    <View style = {styles.textContainer}>
        <View style = {styles.textBox}>
            <Text style = {styles.text}>{props.fieldLabel}</Text>
        </View>
            <TextInput /*
            I used onSubmitEditing as my event recorder here. That was a mistake in hindsight.
            onSubmitEditing records the text when the user presses the submission button (enter on keyboard, return on ios).
            I would recommend using onChangeText. The callback function to handle the change every keystroke, so users can't accidentally
            forget to press return. 

            Then, login credentials could be verified after a button is pressed at the end. 
            */
            style = {styles.textInputBox} onSubmitEditing = {props.handler} ></TextInput>
        
    </View>
  )
};


const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#000099', // To understand this stuff, I would recommend reading the React-native docs on flexbox
    alignItems: 'center',
    justifyContent: 'center',
  },  
    textContainer: {
      width: "40%",
      height: "20%", // These dimensions were found by guess and check until I got something I didn't dislike.
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