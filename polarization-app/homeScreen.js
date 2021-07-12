import React from 'react';
import { Text, View, TextInput} from 'react-native';

export const HomeScreen = function(props){
    return(
    <View >
          <Text>You made it {props.name}!</Text>
    </View>
    )
  };