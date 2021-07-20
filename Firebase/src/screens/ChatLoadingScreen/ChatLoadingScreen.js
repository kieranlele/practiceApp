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

 export default function ChatLoadingScreen(props){ //props is included for the navigation and route props
    const user = useContext(UserContext); //allows us to get the userID
    const [conversations, setConversations] = useState([]); //similar to the HomeScreen code
    const [requests, setRequests] = useState([]); //similar to the HomeScreen code
    const [invitee, setInvitee] = useState("") //Invitee being the person invited to chat
    const userID = user.id; 
    const userEmail = user.email;

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
    const conversationRef = firebase.firestore().collection('Conversations'); //this creates a reference to the Conversations collection
    const firstConversationRef = conversationRef.where("firstAuthorID", "==", userID); //Firestore doesn't have logical OR for queries, so I have to do two separate ones.
    const secondConversationRef = conversationRef.where("secondAuthorID", "==", userID);//These queries check for conversations that involve our user. 
    let conversationRefArray = [firstConversationRef,secondConversationRef]; //more flexible. We can add Refs to the array if ever necessary
    const inviteRef = firebase.firestore().collection('Invites'); // creates a reference to the Invites collection
    let emailExists = false;
    

   useEffect(()=> { //We'll use this to load any existing conversations and invites
        //We go through every conversation included in the two Conversations queries above and add their data to an array 
        conversationRefArray.forEach(conversationRef =>{
        conversationRef.orderBy("lastUpdated","desc") //ordered by when the conversation was last modified
        .onSnapshot(
            querySnapshot => {  //all of this code is similar to the HomeScreen code. 
                let oldConversations = [];
                querySnapshot.forEach(doc => { 
                     const conversation  = doc.data; 
                     conversation.id = doc.id;
                     newConversations.push(conversation);
                })
                 setConversations((prev)=> [...prev, oldConversations]) //spread syntax allows us to update the state with each for loop iteration
            }, error => {
                alert(error);
            }
        )});
        inviteRef.where("recipient", "==", userID) // this does pretty much the same thing as the above, but with invites. 
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
   /*
   The next useEffect() loop is a workaround to an issue I was having. I wanted to invite people by email address
   instead of userName (because I don't have userNames in this code), and so before creating the invite, I wanted to 
   check that it was valid. However, that code reads data from a server, which is asynchronous. So, I created a useEffect loop 
   just for it. 

   Another solution would probably be to return a promise from checkEmail and have that resolve in the onCreateInviteButtonPress 
   function. I'll work on implementing that later. It would have the advantage of not fetching data every keystroke. The free plan
   only allows us 50000 reads a day. 
   */
   useEffect(()=>{
       emailExists = checkEmail(invitee);
   },[invitee]); //whenever invitee changes, we run the checkEmail function (near the bottom of the code). 
                
   

   //We've loaded the possible messages and potential invites we can accept. Let's add methods that create them:

    function onCreateInviteButtonPress(){
        if(emailExists){ //A boolean variable that is modified in the above effect loop with the checkEmail function
            const timestamp = firebase.firestore.FieldValue.serverTimestamp(); 
            const data = {//creates the invite.
                recipientEmail: invitee,  //I'm actually going to have the invite be made with emails instead of ids. 
                authorEmail: userEmail,
                createdAt: timestamp,
            };
            inviteRef //adds our invite to the collection. 
                .add(data) //Right now, I'm getting an error with one of the .add calls in this file. 
                .then(_doc => {
                    setInvitee('') //resets the text entry field for a new entity.
                    Keyboard.dismiss()
                })
                .catch((error) => {
                    alert(error)
                });
        }
        else{
            alert("Email not found"+invitee);//invitee ensures that the email is not undefined. Mainly for troubleshooting.
        }
   }

   /*
   I'm still a bit hazy on how I want to create conversations. Do I want them to have the userID's or emails of both users?
   How do I update the timestamp when they get modified? 
   I think the details will become clearer as I work with this. 
   */
   const onAcceptInviteButtonPress = (firstUser, secondUser) =>{ //code for accepting invites handler function
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
   
   props.navigation.navigate('Chat Screen', {conversationID: conversationID}) /*conversationID is included to access the conversation
   in the chat screen. I had this idea after I created the chat screen, so I haven't implemented it there yet. One screen at a time.*/
    }

    const onResumeConversationButtonPress = (ID) =>{ //same as above function, but with conversations that already exist
        props.navigation.navigate('Chat Screen', {conversationID: ID}); 
    }

    const renderConversation = ({index,item})=>{ // I need to fix formating. TouchableOpacity makes each element in the list a button 
        const ID = item.id;
        return(
            <View style={styles.entityContainer}>
                <TouchableOpacity style={styles.button} onPress = {onResumeConversationButtonPress(ID)}> 
                   <Text style = {styles.buttonText}> {index}. {item.firstAuthorID}, {item.secondAuthorID}</Text>
                </TouchableOpacity>
            </View>
        )
    }
    const renderInvite = ({index,item})=>{ //almost identical to the above. I don't know why I'm using item instead of invite. 
                return(
            <View style={styles.entityContainer}>
                <TouchableOpacity style={styles.button} onPress = {onAcceptInviteButtonPress(item.recipientEmail, item.authorEmail)}> 
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
                        data={requests}
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
