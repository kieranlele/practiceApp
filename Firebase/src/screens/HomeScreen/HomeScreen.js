import React, { useContext, useEffect, useState } from 'react'
import { FlatList, Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native'
import styles from './styles';
import { firebase } from '../../firebase/config'
import { AuthContext } from '../../AuthContext';

export default function HomeScreen(props) {
    const {signOut} = useContext(AuthContext);
    const [entityText, setEntityText] = useState('')
    const [entities, setEntities] = useState([])

    const entityRef = firebase.firestore().collection('entities'); //accesses the entities collection or creates it if it doesn't exist.
    const userID = props.extraData.id //Extra data was passed as an extra prop using screen navigator
    // Apparently, in most cases, it is safer to use React.Context instead. That's something to look into. 

    useEffect(() => {
        entityRef
            .where("authorID", "==", userID) //only fetches the entries that we made
            .orderBy('createdAt', 'desc') //sorts them by the time they were created, most recent first
            .onSnapshot( // onSnapshot allows you to get realtime updates on information stored in a document. Provides you with the contents of a single document

                querySnapshot => {
                    const newEntities = []   //TODO: figure out what is going on down here.
                    querySnapshot.forEach(doc => { //adds each user created entity to the entities array.
                        const entity = doc.data()
                        entity.id = doc.id
                        newEntities.push(entity)
                    });
                    setEntities(newEntities)
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
                text: entityText,
                authorID: userID,
                createdAt: timestamp,
            };
            entityRef
                .add(data)
                .then(_doc => {
                    setEntityText('') //resets the text entry field?
                    Keyboard.dismiss()
                })
                .catch((error) => {
                    alert(error)
                });
        }
    }
    const onSignOut = () =>{
        signOut;
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
                <TouchableOpacity style = {styles.button} onPress = {signOut}>
                    <Text style = {styles.buttonText}>Sign Out</Text>
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
