import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import ListItem from '../../Components/ListItem';

import firebase from '../../Services/firebaseConnection';

export default function About() {

    async function logout(){
        await firebase.auth().signOut();
    }

    useEffect(() => {
        logout();
    }, [])
    return (
        <View style={{backgroundColor: '#191919', height: '100%', width: '100%', alignContent: "center", justifyContent: "center"}}>
            <ActivityIndicator size="large" color="#FFF" />
        </View>
    );
}