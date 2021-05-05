import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ToastAndroid, ScrollView, StyleSheet, Modal } from 'react-native';
import firebase from '../../Services/firebaseConnection';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';

import { SwipeItem, SwipeButtonsContainer } from 'react-native-swipe-item';
import AwesomeAlert from 'react-native-awesome-alerts';


const { width, height } = Dimensions.get('window');

export default function Home() {
    const [loggedUserEmail, setLoggedUserEmail] = useState("");
    const [loggedUserName, setLoggedUserName] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState([]);
    const [searchUserText, setSearchUserText] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [stamps, setStamps] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    const showToastWithGravity = (message) => {
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
        );
    };

    async function giveStar(userKey) {
        let newStampsQuantity = selectedUser.stampsQuantity + 1;
        if (newStampsQuantity < 10) {
            firebase.database().ref('users').child(userKey).child('stampsQuantity').set(newStampsQuantity)
                .then((success) => {
                    //alert("Estrela concedida com sucesso!");
                })
        }
        else {
            firebase.database().ref('users').child(userKey).child('giftsQuantity').set(selectedUser.giftsQuantity + 1);
            firebase.database().ref('users').child(userKey).child('stampsQuantity').set(0);
        }
        giveMeMoney();
    }

    async function giveMeMoney() {
        let myMoney;
        firebase.database().ref('finance').child('july').on("value", (snapshot) => {
            myMoney = snapshot.val();
        });
        myMoney++;
        firebase.database().ref('finance').child('july').set(myMoney);
    }

    async function removeGift(userKey) {
        let newGiftsQuantity = selectedUser.giftsQuantity - 1;
        firebase.database().ref('users').child(userKey).child('giftsQuantity').set(newGiftsQuantity)
            .then((success) => {
                //alert("Brinde resgatado com sucesso!");
            })
    }

    async function checkClientType() {
        let uid = firebase.auth().currentUser.uid;
        var clientType;
        firebase.database().ref('users').child(uid).child('clientType').once("value", (snapshot) => {
            clientType = snapshot.val();

            if (clientType != "Administrator") {
                showToastWithGravity("Você não tem permissão para acessar este aplicativo! " + clientType);
                firebase.auth().signOut();
            }
            else {
                getUsers();
            }
        });
        //alert(JSON.stringify(clientType));
    }

    async function openSelectedProfile(clientUID) {
        await firebase.database().ref('users').child(clientUID).on("value", (snapshot) => {
            setSelectedUser([]);
            let list = {
                key: snapshot.key,
                name: snapshot.val().name,
                email: snapshot.val().email,
                stampsQuantity: snapshot.val().stampsQuantity,
                giftsQuantity: snapshot.val().giftsQuantity,
                clientType: snapshot.val().clientType
            }
            setSelectedUser(list);
        });
        let newStamps = [];
        for (let index = 1; index <= 10; index++) {
            let list = {
                key: index,
                value: index
            }
            newStamps.push(list);
            //setStamps(oldArray => [...oldArray, 0]);
        }
        setStamps(newStamps);
        setModalVisible(true);
        //alert(JSON.stringify(stamps));
    }

    function getUsers() {
        let uid = firebase.auth().currentUser.uid;
        firebase.database().ref('users').on('value', (snapshot) => {
            setUsers([]);
            snapshot.forEach((childItem) => {
                let list = {
                    key: childItem.key,
                    email: childItem.val().email,
                    name: childItem.val().name,
                    giftsQuantity: childItem.val().giftsQuantity,
                    stampsQuantity: childItem.val().stampsQuantity,
                    clientType: childItem.val().clientType
                }
                setUsers(oldArray => [...oldArray, list]);
            })
        });
    }

    function searchUser() {
        setFilteredUsers([]);
        users.forEach((user) => {
            if (user.name.toUpperCase().includes(searchUserText.toUpperCase()) || user.name.toUpperCase() == searchUserText.toUpperCase()) {
                setFilteredUsers(oldArray => [...oldArray, user]);
            }
        });
    }

    function clearFilteredUsers() {
        setFilteredUsers([]);
        setSearchUserText("");
    }

    useEffect(() => {
        checkClientType();
        setLoggedUserEmail(firebase.auth().currentUser.email);
        //openSelectedProfile();
    }, [])

    return (
        <View style={styles.container}>
            <View style={{ width: '90%', paddingBottom: 15 }}>
                <Text style={{ fontSize: 25, width: '100%', textAlign: "left" }}>Administrador</Text>
                <Text style={{ fontSize: 20, width: '100%', textAlign: "left" }}>{loggedUserEmail}</Text>
            </View>
            <View style={{ width: '90%', height: 60, alignItems: "center", justifyContent: "center", flexDirection: "row", borderWidth: 1, borderRadius: 7.5, paddingLeft: 25, marginBottom: 25 }}>
                <View style={{ width: '60%' }}>
                    <TextInput value={searchUserText} placeholder="Buscar Cliente..." style={{ fontSize: 18 }} onChangeText={(searchUserText) => { setSearchUserText(searchUserText) }}></TextInput>
                </View>
                <TouchableOpacity style={{ width: '20%', alignItems: "center" }} onPress={() => { searchUser() }}>
                    <Icon name="search-outline" size={40} color={"#000"}></Icon>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: '20%', alignItems: "center" }} onPress={() => { clearFilteredUsers() }}>
                    <Icon name="return-down-back-outline" size={40} color={"#000"}></Icon>
                </TouchableOpacity>
            </View>
            <ScrollView>
                <FlatList
                    contentContainerStyle={{ width: width, paddingLeft: 20 }}
                    data={filteredUsers.length > 0 ? filteredUsers : users}
                    renderItem={({ item }) => (
                        // Componente que será renderizado para cada usuário cadastrado
                        <TouchableOpacity style={styles.usersButton} onPress={() => { openSelectedProfile(item.key) }}>
                            <Text style={[styles.usersText]}>Cliente: {item.name}</Text>
                            <Text style={[styles.usersText, { color: "#777" }]}>Email: {item.email}</Text>
                            <Text style={[styles.usersText, { color: "#777" }]}>Carimbos: {item.stampsQuantity}</Text>
                            <Text style={[styles.usersText, { color: "#428BCA" }]}>Brindes: {item.giftsQuantity}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id}
                >

                </FlatList>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                <View style={styles.modalView}>
                    <TouchableOpacity style={{ width: '100%', alignItems: "center", height: '10%' }} onPress={() => { setModalVisible(false) }}>
                        <Icon name="arrow-down-circle-outline" size={50}></Icon>
                    </TouchableOpacity>
                    <View style={{ padding: 15, height: '80%' }}>
                        <Text style={styles.selectedUserName}>{selectedUser.name}</Text>
                        <Text style={styles.selectedUserEmail}>{selectedUser.email}</Text>
                        <View style={{ flexDirection: "row" }}>
                            <View style={{ width: '50%' }}>
                                <Text style={[styles.selectedUserStampsQuantity, { marginTop: 15 }]}>Carimbos acumulados: </Text>
                            </View>

                            <View style={{ width: '50%', alignItems: "flex-end" }}>
                                <Text style={[styles.selectedUserStampsQuantity, styles.badge]}>{selectedUser.stampsQuantity}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: "row" }}>
                            <View style={{ width: '50%' }}>
                                <Text style={[styles.selectedUserGiftsQuantity, { marginTop: 15 }]}>Brindes acumulados: </Text>
                            </View>
                            <View style={{ width: '50%', alignItems: "flex-end" }}>
                                <Text style={[styles.selectedUserGiftsQuantity, styles.badge]}>{selectedUser.giftsQuantity}</Text>
                            </View>
                        </View>
                        <FlatList
                            contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", paddingTop: 25 }}
                            data={stamps}
                            renderItem={({ item }) => (
                                // Componente que será renderizado, para cada dispositivo cadastrado
                                <View style={{ alignItems: "center" }}>
                                    {item.value > selectedUser.stampsQuantity ?
                                        (
                                            <Icon name="star-outline" size={70} color={"#000"}></Icon>
                                        )
                                        :
                                        (
                                            <Icon name="star" size={70} color={"#ffbf00"}></Icon>
                                        )

                                    }
                                </View>
                            )}
                            keyExtractor={item => item.id}
                        >

                        </FlatList>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                            <Icon name="star" size={130} color={"#ffbf00"}></Icon>
                            <Text style={{ fontSize: 35, height: 95, textAlignVertical: "bottom" }}>x{selectedUser.giftsQuantity}</Text>
                        </View>
                    </View>
                    <View style={{ height: '10%', width: '100%', backgroundColor: '#FFF', flexDirection: "row" }}>
                        <TouchableOpacity style={{ width: '50%', padding: 15 }} onPress={() => { giveStar(selectedUser.key) }}>
                            <Icon name="star" size={40} color={"#ffbf00"}></Icon>
                        </TouchableOpacity>
                        <TouchableOpacity disabled={selectedUser.giftsQuantity > 0 ? false : true} style={{ width: '50%', alignItems: "flex-end", padding: 15 }} onPress={() => { removeGift(selectedUser.key) }}>
                            <Icon name="download-sharp" size={40} color={"#d9534f"}></Icon>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    searchCard: {
        height: '10%',
        width: '90%',
        borderRadius: 10,
        borderWidth: 0.5,
        paddingLeft: 25,
        marginBottom: 20,
        flexDirection: "row",
        alignItems: "center"
    },
    itemContainer: {
        flex: 1,
        alignItems: 'center'
    },
    modalView: {
        height: '100%',
        width: '100%',
        backgroundColor: "#FFF"
    },
    selectedUserName: {
        fontSize: 25
    },
    selectedUserEmail: {
        fontSize: 20
    },
    selectedUserStampsQuantity: {
        fontSize: 18
    },
    selectedUserGiftsQuantity: {
        fontSize: 18
    },
    badge: {
        color: "#FFF",
        fontWeight: "bold",
        marginTop: 15,
        width: 50,
        borderRadius: 100,
        textAlign: "center",
        backgroundColor: "#428BCA"
    },
    container: {
        height: height - 50,
        width: width,
        backgroundColor: '#FFF',
        paddingTop: 25,
        alignItems: "center"
    },
    usersButton: {
        width: width * 0.9,
        height: 100,
        borderBottomWidth: 1,
        backgroundColor: '#FFF'
    },
    usersText: {
        color: '#000',
        fontSize: 17,
        fontWeight: "bold"
    }
})