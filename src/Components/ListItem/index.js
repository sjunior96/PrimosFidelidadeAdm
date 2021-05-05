import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { TouchableOpacity } from 'react-native-gesture-handler';
import firebase from '../../Services/firebaseConnection';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ListItem({ data, openSelectedPromo }) {

    function RightActions(progress, dragX) {

        const scale = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp'
        })

        return (
            <TouchableOpacity>
                <View style={styles.rightAction}>
                    <Icon name="trash" size={30} color={'#FFF'}></Icon>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <Swipeable
            renderRightActions={RightActions}
        >
            <View style={styles.container}>
                <TouchableOpacity style={styles.promosButton} onPress={() => { openSelectedPromo() }}>
                    <Text style={[styles.usersText, { fontSize: 20 }]}>{data.title}</Text>
                    <Text style={[styles.usersText, { color: "#428BCA", textAlign: "right" }]}>R$ {parseFloat(data.value).toFixed(2).toString().replace(".", ",")}</Text>
                </TouchableOpacity>
            </View>
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        paddingHorizontal: 10,
        paddingVertical: 20
    },
    text: {
        fontSize: 17,
        color: '#222'
    },
    leftAction: {
        backgroundColor: '#388E3C',
        justifyContent: "center",
        flex: 1
    },
    rightAction: {
        height: '100%',
        padding: 20,
        alignItems: "center",
        backgroundColor: '#FF0000',
        justifyContent: "center"
    },
    actionText: {
        fontSize: 17,
        color: '#FFF',
        padding: 20
    },
    usersText: {
        color: '#000',
        fontSize: 20,
        fontWeight: "bold",
        width: '50%'
    },
    promosButton: {
        width: '90%',
        height: 30,
        backgroundColor: '#FFF',
        flexDirection: "row",
        alignItems: "center"
    },
})