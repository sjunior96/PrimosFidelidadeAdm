import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image, ToastAndroid, ScrollView, StyleSheet, Modal } from 'react-native';
import firebase from '../../Services/firebaseConnection';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';

import { SwipeItem, SwipeButtonsContainer } from 'react-native-swipe-item';
import AwesomeAlert from 'react-native-awesome-alerts';
import Swipeable from 'react-native-gesture-handler/Swipeable';

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
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [myMoney, setMyMoney] = useState(0);

    const showToastWithGravity = (message) => {
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
        );
    };

    function RightActions({ progress, dragX, userUID }) { //Botão que será renderizado ao lado do Swipeable

        const scale = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp'
        });

        return (
            <TouchableOpacity onPress={() => { deleteUser(userUID) }}>
                <View style={styles.rightActionButton}>
                    <Icon name="trash" size={30} color={'#FFF'}></Icon>
                </View>
            </TouchableOpacity>
        );
    }

    async function giveStar(userKey) {
        let newStampsQuantity = selectedUser.stampsQuantity + 1;
        if (newStampsQuantity < 4) {
            firebase.database().ref('users').child(userKey).child('stampsQuantity').set(newStampsQuantity)
                .then((success) => {
                    //alert("Estrela concedida com sucesso!");
                })
        }
        else {
            firebase.database().ref('users').child(userKey).child('giftsQuantity').set(selectedUser.giftsQuantity + 1);
            firebase.database().ref('users').child(userKey).child('stampsQuantity').set(0);
        }
        getActualMoney();
        updateMoney();
    }

    async function getActualMoney() {
        let months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
        let money;
        await firebase.database().ref('finance').child(months[new Date().getMonth()]).on("value", (snapshot) => {
            money = snapshot.val();
            money++;
            setMyMoney(money);
        });
        //alert("Teste: " + myMoney);
    }

    async function updateMoney() {
        let months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
        await firebase.database().ref('finance').child(months[new Date().getMonth()]).set(myMoney);
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
        for (let index = 1; index <= 4; index++) {
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

    async function deleteUser(userUID) {
        alert(userUID);
        await firebase.database().ref('users').child(userUID).remove()
            .then((success) => {
                showToastWithGravity("Cliente excluído com sucesso!");
            })
            .catch((error) => {
                alert("Erro ao deletar cliente: " + JSON.stringify(error));
            });
        getUsers();
    }

    function clearFilteredUsers() {
        setFilteredUsers([]);
        setSearchUserText("");
    }

    useEffect(() => {
        checkClientType();
        setLoggedUserEmail(firebase.auth().currentUser.email);
        getActualMoney();
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
                    style={{ height: height - 320 }}
                    contentContainerStyle={{ width: width, paddingLeft: 20 }}
                    data={filteredUsers.length > 0 ? filteredUsers : users}
                    renderItem={({ item }) => (
                        // Componente que será renderizado para cada usuário cadastrado
                        <Swipeable
                            renderRightActions={(progress, dragX) => (<RightActions progress={progress} dragX={dragX} userUID={item.key}></RightActions>)}
                        >
                            <TouchableOpacity style={styles.usersButton} onPress={() => { openSelectedProfile(item.key) }}>
                                <Text style={[styles.usersText]}>Cliente: {item.name}</Text>
                                <Text style={[styles.usersText, { color: "#777" }]}>Email: {item.email}</Text>
                                <Text style={[styles.usersText, { color: "#777" }]}>Carimbos: {item.stampsQuantity}</Text>
                                <Text style={[styles.usersText, { color: "#428BCA" }]}>Brindes: {item.giftsQuantity}</Text>
                            </TouchableOpacity>
                        </Swipeable>
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
                            <View style={{ width: '70%' }}>
                                <Text style={[styles.selectedUserStampsQuantity, { marginTop: 15 }]}>Carimbos acumulados: </Text>
                            </View>

                            <View style={{ width: '30%', alignItems: "flex-end" }}>
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
                                contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", paddingTop: 25, justifyContent: "center" }}
                                data={stamps}
                                renderItem={({ item }) => (
                                    // Componente que será renderizado, para cada dispositivo cadastrado
                                    <>
                                        {item.value > selectedUser.stampsQuantity ?
                                            (
                                                <View style={{ alignItems: "center", justifyContent: "center", width: 69, height: 69, backgroundColor: "#000", borderRadius: 100, marginRight: 1, marginBottom: 3, opacity: 0.2 }}>
                                                    <Image style={{ width: 59, height: 59 }} source={require('../../assets/logo.png')}></Image>
                                                </View>
                                            )
                                            :
                                            (
                                                <View style={{ alignItems: "center", justifyContent: "center", width: 69, height: 69, backgroundColor: "#000", borderRadius: 100, marginRight: 1, marginBottom: 3, }}>
                                                    <Image style={{ width: 59, height: 59 }} source={require('../../assets/logo.png')}></Image>
                                                </View>
                                            )

                                        }
                                    </>
                                )}
                                keyExtractor={item => item.id}
                            >

                            </FlatList>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                            <View style={{ backgroundColor: "#000", borderRadius: 100, height: 175, width: 175, alignItems: "center", justifyContent: "center", paddingTop: 10 }}>
                                <Image style={{ width: 150, height: 150 }} source={require('../../assets/logo.png')}></Image>
                            </View>
                            <Text style={{ fontSize: 35, height: 95, textAlignVertical: "bottom" }}>x{selectedUser.giftsQuantity}</Text>
                        </View>
                    </View>
                    <View style={{ height: '10%', width: '100%', backgroundColor: '#FFF', flexDirection: "row" }}>
                        <TouchableOpacity style={{ width: '50%', padding: 15 }} onPress={() => { setAlertMessage("Tem certeza de que deseja dar um adesivo para o cliente " + selectedUser.name + "?"); setAlertVisible(true); }}>
                            <Icon name="star" size={40} color={"#ffbf00"}></Icon>
                        </TouchableOpacity>
                        <TouchableOpacity disabled={selectedUser.giftsQuantity > 0 ? false : true} style={{ width: '50%', alignItems: "flex-end", padding: 15 }} onPress={() => { setAlertMessage("Tem certeza de que deseja dar baixa em um brinde do cliente " + selectedUser.name + "?"); setAlertVisible(true); }}>
                            <Icon name="download-sharp" size={40} color={"#d9534f"}></Icon>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/** ALERTA PARA CONFIRMAR OU CANCELAR AÇÃO DE DAR ADESIVO PARA O CLIENTE E DE DAR BAIXA EM BRINDE ACUMULADO */}
            <AwesomeAlert
                show={alertVisible}
                showProgress={false}
                title="Atenção"
                message={alertMessage}
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={true}
                showConfirmButton={true}
                cancelText="Não"
                confirmText="Sim"
                confirmButtonColor="#000"
                cancelButtonColor="#DD6B55"
                onCancelPressed={() => {
                    setAlertVisible(false);
                }}
                onConfirmPressed={() => {
                    if (alertMessage == ("Tem certeza de que deseja dar baixa em um brinde do cliente " + selectedUser.name + "?")) {
                        setAlertVisible(false);
                        removeGift(selectedUser.key);
                    }
                    else {
                        setAlertVisible(false);
                        giveStar(selectedUser.key);
                    }
                }}
                cancelButtonStyle={{ width: 100, height: 50, justifyContent: "center", alignItems: "center" }}
                confirmButtonStyle={{ width: 100, height: 50, justifyContent: "center", alignItems: "center" }}
                confirmButtonTextStyle={{ fontSize: 18 }}
                cancelButtonTextStyle={{ fontSize: 18 }}
                titleStyle={{ fontSize: 22 }}
                messageStyle={{ fontSize: 18 }}
            />
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
        backgroundColor: "#000"
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
        height: 120,
        borderBottomWidth: 1,
        backgroundColor: '#FFF',
        paddingVertical: 10
    },
    usersText: {
        color: '#000',
        fontSize: 17,
        fontWeight: "bold"
    },
    rightActionButton: {
        height: '100%',
        padding: 20,
        alignItems: "center",
        backgroundColor: '#FF0000',
        justifyContent: "center"
    },
})