import React, {useState} from 'react';
import { Text, View, TextInput, Button, StyleSheet} from 'react-native';

const Fruit = function() {
      const [apples, setApples] = useState(0);
      return (
            <View styles={style.container}>
                  <Button title='funbutton' onPress={() => setApples(apples + 1)} style={style.bigBlue}/>
                  <Text style={style.bigBlue}> you have {apples} apples </Text>
            </View>
      )
};

export const HomeScreen = function(props){
    return(
    <View >
          <Text>You made it {props.name}!</Text>
          <Fruit style={style.container}/>
    </View>
    )
  };

  const style = StyleSheet.create({
      bigBlue: {
            color: 'blue',
            fontWeight: 'bold',
            fontSize: 30,
      },
      container: {
            marginTop: 50,
          },
});