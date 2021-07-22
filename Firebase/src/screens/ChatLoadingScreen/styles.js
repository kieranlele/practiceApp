import { StyleSheet } from 'react-native';
    //TODO: Modify as needed
export default StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    formContainer: {
        flexDirection: 'row',
        height: 80,
        marginTop: 40,
        marginBottom: 20,
        flex: 1,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 30,
        paddingRight: 30,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    input: {
        height: 20,
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: 'white',
        paddingLeft: 16,
        flex: 1,
        marginRight: 5
    },
    button: {
        height: 20,
        borderRadius: 5,
        backgroundColor: '#788eec',
        flex: 1,
        alignItems: "center",
        justifyContent: 'center'
    },
    listButton: {
        height: 20,
        borderRadius:5,
        backgroundColor: '#788eec',
        flex: 1,
        alignItems: "center",
        justifyContent: 'center'
    },
    buttonText: {
        color: 'white',
    },
    listContainer: { //holds the list
        marginTop: 20,
        padding: 20,
    },
    columnContainer:{ // each column container holds a column
        flex: 1,
        flexDirection: "column",
    },
    conversationContainer: { // used to contain the list entries
        marginTop: 16,
        borderBottomColor: '#cccccc',
        borderBottomWidth: 1,
        paddingBottom: 16
    },
    conversationText: { //list entry text
        color: '#333333'
    },
    headerText: {
        padding:20,
        color: "#333333",
        fontSize: 30
    }
})
//container -> formContainer -> columnContainer => listContainer -> listButton/button