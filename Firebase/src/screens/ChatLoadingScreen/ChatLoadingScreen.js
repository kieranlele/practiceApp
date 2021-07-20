// imports here
import React, { useContext, useEffect, useState } from 'react'
import { FlatList, Text, TextInput, Touchable, TouchableOpacity, View } from 'react-native'
import styles from './styles';
import { firebase } from '../../firebase/config'
import { ChatContext, UserContext } from '../../contexts/Context.js';
/*
How I want this to work for now:
    1. Bob requests to chat with Alice
    2. Bob's App waits for a similar request from Alice
    3. Upon receiving her request, they are both moved into the chat window, which ends when one of them exits.

    Functionality to implement later: //Look into Firebase functions for some of these things.
        1. Asynchronous chatting - Alice and Bob can chat when the other isn't online
        2. Chat invitations - some sort of screen popup upon login? - definitely look into this
        3. Forced redirect to chat window - Alice requests to chat, Bob takes a while to respond to invitation. 
                                            - when he does, the chat screen opens for both of them
*/

 export default function ChatLoadingScreen(props){
    const user = useContext(UserContext);
    const [conversations, setConversations] = useState([]);
    const [requests, setRequests] = useState([]);
    const [invitee, setInvitee] = useState("")
    const userID = user.id;

    //useEffect to check for a chat request from before the page loaded 
    /*
    For each request logged, we go through and check if we are requested. 
    Each request for us to chat is listed for us (entity style)
    Clicking on a request takes us to the chat page. 

    Possible procedure (this may allow for asynchronous chatting):
        1. Bob requests to chat. This request is stored in a request document
        2. Alice's app checks if someone wants to chat in the useEffect loop 
            2a. This is stored in a request collection that contains the user sending the request and the intended recipient.
            2b. If she accepts, it creates a new conversation.
            2c. If one already exists, she can chat in it without having to accept again. 
    */
    const conversationRef = firebase.firestore().collection('Conversations');
    const firstConversationRef = conversationRef.where("firstAuthorID", "==", userID);
    const secondConversationRef = conversationRef.where("secondAuthorID", "==", userID);
    let conversationRefArray = [firstConversationRef,secondConversationRef];
    const inviteRef = firebase.firestore().collection('Invites');
    let emailExists = false;
    

   useEffect(()=> { //We'll use this to load any existing conversations and invites
        conversationRefArray.forEach(conversationRef =>{
        conversationRef.orderBy("lastUpdated","desc")
        .onSnapshot(
            querySnapshot => { 
                let oldConversations = []
                querySnapshot.forEach(doc => { 
                     let conversation  = doc.data
                     conversation.id = doc.id
                     newConversations.push(conversation)
                })
                 setConversations((prev)=> [...prev, oldConversations])
            }, error => {
                alert(error);
            }
        )});
        inviteRef.where("recipient", "==", userID)
        .orderBy("createdAt", "desc")
        .onSnapshot(
            querySnapshot => {
              let inviteList = [];
                querySnapshot.forEach(doc =>{
                    let invite = doc.data;
                    invite.id = doc.id;
                    inviteList.push(invite);
                })
                setRequests(inviteList);
            }, error => {
                alert(error)
            }
        )
   },[]);
   useEffect(()=>{
       emailExists = checkEmail(invitee);
   },[invitee]);
   

   //We've loaded the possible messages and potential invites we can accept. Let's add methods that create them:

   async function onCreateInviteButtonPress(){
        if(emailExists){
            const timestamp = firebase.firestore.FieldValue.serverTimestamp(); 
            const data = {
                recipient: invitee, //creates the invite.
                authorID: userID,
                createdAt: timestamp,
            };
            inviteRef
                .add(data)
                .then(_doc => {
                    setInvitee('') //resets the text entry field for a new entity.
                    Keyboard.dismiss()
                })
                .catch((error) => {
                    alert(error)
                });
        }
        else{
            alert("Email not found"+invitee);
        }
   }

   const onAcceptInviteButtonPress = (firstUser, secondUser) =>{
        //first, we create a conversation with the two users
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        const data = {
            firstAuthorID: firstUser,
            secondAuthorID: secondUser,
            lastUpdate: timestamp,
        }
        conversationRef
        .add(data)
        .then((response)=>{
            const conversationID = doc.id;
        } )
        .catch((error)=>alert(error))
   
   props.navigation.navigate('Chat Screen', {conversationID: conversationID})
    }
    const onResumeConversationButtonPress = (ID) =>{
        props.navigation.navigate('Chat Screen', {conversationID: ID})
    }
    const renderConversation = ({index,item})=>{
        const ID = item.id;
        return(
            <View style={styles.entityContainer}>
                <TouchableOpacity style={styles.button} onPress = {onResumeConversationButtonPress(ID)}> 
                   <Text style = {styles.buttonText}> {index}. {item.firstAuthorID}, {item.secondAuthorID}</Text>
                </TouchableOpacity>
            </View>
        )
    }
    const renderInvite = ({index,item})=>{
                return(
            <View style={styles.entityContainer}>
                <TouchableOpacity style={styles.button} onPress = {onAcceptInviteButtonPress()}> 
                   <Text style = {styles.buttonText}> {index}. {item.authorID}, {item.recipient}</Text>
                </TouchableOpacity>
            </View>
        )
    }
    

   return (
        <View style = {styles.container}>
            <View style = {styles.formContainer}>
                <Text style = {styles.input}>Existing Conversations</Text>
                { conversations && (
                <View style={styles.listContainer}>
                    <FlatList //neeeded to render each element in the list. We probably could have used a for loop as well. 
                        data={conversations}
                        renderItem={renderConversation}
                        keyExtractor={(item) => item.id}
                        removeClippedSubviews={true}
                    />
                </View> )}
                <Text style = {styles.input}>Pending Invites</Text>
                { conversations && (
                <View style={styles.listContainer}>
                    <FlatList //neeeded to render each element in the list. We probably could have used a for loop as well. 
                        data={conversations}
                        renderItem={renderInvite}
                        keyExtractor={(item) => item.id}
                        removeClippedSubviews={true}
                    />
                </View> )}
                <Text style = {styles.input}>Create Invite</Text>
                <TextInput style={styles.input}
                    placeholder='Add new entity'
                    placeholderTextColor="#aaaaaa"
                    onChangeText={(text) => setInvitee(text)}
                    value={invitee}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"/>
                <TouchableOpacity style={styles.button} onPress = {onCreateInviteButtonPress}>
                    <Text style = {styles.buttonText}>Send Invite</Text>
                </TouchableOpacity>
            </View>
        </View>
    )

}
const  checkEmail = (email) =>{ //for some reason, exists always evaluates to false. I don't know why.                             //Nevermind. It's not that its evaluating to false. It is because it is asynchronous.
    let exists = false;
    const userRef =  firebase.firestore().collection('users').where("email", "==", email) //max, this should only be one file, so the query shouldn't be too expensive
     userRef.onSnapshot(  
        querySnapshot =>{
            querySnapshot.forEach(doc =>{
                exists = true;
                alert("Email exists");
            })
        }, error => alert(error)
    );
    return exists;
}
