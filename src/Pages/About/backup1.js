import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TouchableHighlight } from 'react-native';
import firebase from '../../Services/firebaseConnection';

import Swipeable from 'react-native-swipeable';


export default function About() {

    const leftContent = <Text>Pull to activate</Text>;

    const rightButtons = [
        <TouchableOpacity onPress={() => {alert("Button 1")}}><Text>Button 1</Text></TouchableOpacity>,
        <TouchableOpacity onPress={() => {alert("Button 2")}}><Text>Button 2</Text></TouchableOpacity>
    ];

    var teste = [
        { id: 1, nome: "Silvio" },
        { id: 2, nome: "Fernanda" }
    ]

    async function logout() {
        await firebase.auth().signOut();
    }

    useEffect(() => {
        //logout();
    }, [])

    return (
        <View style={{ height: '100%', width: '100%', backgroundColor: '#FFF', alignItems: "center", justifyContent: "center" }}>
            <Swipeable leftContent={leftContent} rightButtons={rightButtons}>
                <TouchableOpacity onPress={() => {alert("Funcionou")}}>
                    <Text>My swipeable content</Text>
                </TouchableOpacity>
            </Swipeable>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '80%',
        height: 100,
        alignSelf: 'center',
        marginVertical: 5,
    },
    swipeContentContainerStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        borderColor: '#e3e3e3',
        borderWidth: 1,
    }
});