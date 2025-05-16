import * as React from 'react';
import { View } from "react-native";
import { TextInput } from 'react-native-paper';

export default function Index() {
  const [text, setText] = React.useState("")

  return (
    <View>
      <TextInput
        label="Email"
        value={text}
        onChangeText={text => setText(text)}
      />
    </View>
  );
}
