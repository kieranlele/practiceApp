import React, { useContext, useEffect, useState } from 'react'
import { FlatList, Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native'
import styles from './styles';
import { firebase } from '../../firebase/config'
import { AuthContext, UserContext } from '../../contexts/Context';

export default function HomeScreen(props) {
    const {signOut} = useContext(AuthContext);
    const user = useContext(UserContext);
    const [entityText, setEntityText] = useState('')
    const [entities, setEntities] = useState([])

    const entityRef = firebase.firestore().collection('entities'); //accesses the entities collection or creates it if it doesn't exist.
    //const userID = props.extraData.id 
    //Extra data was passed as an extra prop using screen navigator
    // Apparently, in most cases, it is safer to use React.Context instead. See below.
    const userID = user.id;

    useEffect(() => {
        entityRef
            .where("authorID", "==", userID) //only fetches the entries that we made
            .orderBy('createdAt', 'desc') //sorts them by the time they were created, most recent first
            .onSnapshot( // onSnapshot allows you to get realtime updates on information stored in a document. Provides you with the contents of a single document
                            //onSnapshot creates a querySnapshot object, the results of our query.
                querySnapshot => { //we call the querySnapshot returned from onSnapshot querySnapshot
                    const newEntities = []   //we create an array to hold our new entities.
                    querySnapshot.forEach(doc => { //adds each user created entity to the entities array.
                        const entity = doc.data() //creates the entity
                        entity.id = doc.id // gives it the id of our document
                        newEntities.push(entity) //adds it to the arry
                    });
                    setEntities(newEntities) //updates the Entities state variable with past entities.
                },
                error => {
                    alert(error)
                }
            )
    }, [])

    const onAddButtonPress = () => { // adds an entity to the entities collection
        if (entityText && entityText.length > 0) {
            const timestamp = firebase.firestore.FieldValue.serverTimestamp(); 
            const data = {
                text: entityText, //creates the entity.
                authorID: userID,
                createdAt: timestamp,
            };
            entityRef
                .add(data)
                .then(_doc => {
                    setEntityText('') //resets the text entry field for a new entity.
                    Keyboard.dismiss()
                })
                .catch((error) => {
                    alert(error)
                });
        }
    }
    const renderEntity = ({item, index}) => { //this is called to render each element in the entities list
        return (
            <View style={styles.entityContainer}>
                <Text style={styles.entityText}> 
                    {index}. {item.text}
                </Text>
            </View>
        )
    }

    return ( 
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder='Add new entity'
                    placeholderTextColor="#aaaaaa"
                    onChangeText={(text) => setEntityText(text)}
                    value={entityText}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <TouchableOpacity style={styles.button} onPress={onAddButtonPress}>
                    <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.button} onPress = {signOut}> {/*I'm not sure if the signOut button was in the last commit*/}
                    <Text style = {styles.buttonText}>Sign Out</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.button} onPress = {()=> props.navigation.navigate('ChatLoadingScreen')}> {/*navigates to the new section of code*/}
                    <Text style = {styles.buttonText}>Go To Chat</Text>
                </TouchableOpacity>
            </View>
            { entities && (
                <View style={styles.listContainer}>
                    <FlatList //neeeded to render each element in the list. We probably could have used a for loop as well. 
                        data={entities}
                        renderItem={renderEntity}
                        keyExtractor={(item) => item.id}
                        removeClippedSubviews={true}
                    />
                </View>
            )}
        </View>
    )
}
