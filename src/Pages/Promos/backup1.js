import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, ToastAndroid, TextInput, TouchableOpacity, Modal, Picker } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase from '../../Services/firebaseConnection';
import { FlatList } from 'react-native-gesture-handler';

import Swipeable from 'react-native-swipeable';

const { width, height } = Dimensions.get('window');

export default function Promos() {

    const [modalVisible, setModalVisible] = useState(false);
    const [promoStatus, setPromoStatus] = useState("Ativo");
    const [title, setTitle] = useState("");
    const [value, setValue] = useState(parseFloat(0).toFixed(2).toString().replace(".", ","));
    const [description, setDescription] = useState("");
    const [promos, setPromos] = useState([]);
    const [selectedPromoUID, setSelectedPromoUID] = useState("");
    const [filteredPromos, setFilteredPromos] = useState([]);
    const [searchTextPromo, setSearchTextPromo] = useState("");

    const showToastWithGravity = (message) => {
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
        );
    };

    async function openSelectedPromo(promoUID) {
        await firebase.database().ref('promos').child(promoUID).on("value", (snapshot) => {
            setSelectedPromoUID(promoUID);
            setPromoStatus(snapshot.val().promoStatus);
            setDescription(snapshot.val().description);
            setValue(parseFloat(snapshot.val().value).toFixed(2).toString().replace(".", ","));
            setTitle(snapshot.val().title);
        });

        setModalVisible(true);
        //alert(JSON.stringify(stamps));
    }

    function clearForm() {
        setPromoStatus("Ativo");
        setSelectedPromoUID("");
        setTitle("");
        setValue(parseFloat(0).toFixed(2).toString().replace(".", ","));
        setDescription("");
        setModalVisible(false);
    }

    async function getPromos() {
        firebase.database().ref('promos').on("value", (snapshot) => {
            setPromos([]);
            snapshot.forEach((childItem) => {
                let list = {
                    key: childItem.key,
                    title: childItem.val().title,
                    value: parseFloat(childItem.val().value).toFixed(2),
                    description: childItem.val().description,
                    promoStatus: childItem.val().promoStatus
                }
                setPromos(oldArray => [...oldArray, list]);
            })
        })
    }

    async function savePromo() {
        if (selectedPromoUID == "") {
            let newPromoKey = firebase.database().ref('promos').push().key;
            await firebase.database().ref('promos').child(newPromoKey).set({
                title: title,
                value: value,
                description: description,
                promoStatus: promoStatus
            }).then((success) => {
                showToastWithGravity("Promoção cadastrada com sucesso!");
                clearForm();
            }).catch((error) => {
                alert(JSON.stringify(error));
            });
        }
        else {
            await firebase.database().ref('promos').child(selectedPromoUID).set({
                title,
                value,
                promoStatus,
                description
            }).then((success) => {
                showToastWithGravity("Promoção atualizada com sucesso!");
                clearForm();
            }).catch((error) => {
                alert(JSON.stringify(error));
            });
        }

    }

    function searchPromo() {
        setFilteredPromos([]);
        promos.forEach((promo) => {
            if (promo.title.toUpperCase().includes(searchTextPromo.toUpperCase()) || promo.title.toUpperCase() == searchTextPromo.toUpperCase()) {
                setFilteredPromos(oldArray => [...oldArray, promo]);
            }
        });
    }

    function clearFilteredPromos() {
        setFilteredPromos([]);
        setSearchTextPromo("");
    }

    useEffect(() => {
        getPromos();
    }, [])

    const leftContent = <Text>Pull to activate</Text>;

    const rightButtons = [
        <TouchableOpacity style={styles.deleteButton} onPress={() => { alert("Button 1") }}><Icon name="trash" size={30} color={"#FFF"}></Icon></TouchableOpacity>
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.promosTitle}>Promoções</Text>
            <View style={{ width: '90%', height: 60, alignItems: "center", justifyContent: "center", flexDirection: "row", borderWidth: 1, borderRadius: 7.5, paddingLeft: 10, marginBottom: 25 }}>
                <View style={{ width: '55%' }}>
                    <TextInput value={searchTextPromo} placeholder="Buscar Promoção..." style={{ fontSize: 18 }} onChangeText={(searchTextPromo) => { setSearchTextPromo(searchTextPromo) }}></TextInput>
                </View>
                <TouchableOpacity style={{ width: '15%', alignItems: "center" }} onPress={() => { searchPromo() }}>
                    <Icon name="search-outline" size={40} color={"#000"}></Icon>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: '15%', alignItems: "center" }} onPress={() => { clearFilteredPromos() }}>
                    <Icon name="return-down-back-outline" size={40} color={"#000"}></Icon>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: '15%', alignItems: "center" }} onPress={() => { setModalVisible(true) }}>
                    <Icon name="add-outline" size={40} color={"#000"}></Icon>
                </TouchableOpacity>
            </View>

            <ScrollView>
                <FlatList
                    style={{ height: height }}
                    contentContainerStyle={{ width: width, paddingLeft: 20 }}
                    data={filteredPromos.length > 0 ? filteredPromos : promos}
                    renderItem={({ item }) => (
                        // Componente que será renderizado para cada usuário cadastrado
                        <Swipeable leftContent={leftContent} rightButtons={rightButtons}>
                            <TouchableOpacity style={styles.promosButton} onPress={() => { openSelectedPromo(item.key) }}>
                                <Text style={[styles.usersText, { fontSize: 20 }]}>{item.title}</Text>
                                <Text style={[styles.usersText, { color: "#428BCA", textAlign: "right" }]}>R$ {parseFloat(item.value).toFixed(2).toString().replace(".", ",")}</Text>
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
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity style={{ width: '100%', alignItems: "center" }} onPress={() => { clearForm() }}>
                            <Icon name="arrow-down-circle-outline" size={50} color={"#000"}></Icon>
                        </TouchableOpacity>
                        {selectedPromoUID.length > 0 ?
                            (<Text style={{ fontSize: 25 }}>Editar Promoção</Text>)
                            :
                            (<Text style={{ fontSize: 25 }}>Nova Promoção</Text>)
                        }
                    </View>
                    <View style={styles.modalBody}>
                        <View style={[styles.input, { justifyContent: "flex-start" }]}>
                            <Picker
                                selectedValue={promoStatus}
                                style={{ height: 50, width: '100%' }}
                                onValueChange={(itemValue, itemIndex) => setPromoStatus(itemValue)}
                            >
                                <Picker.Item label="Ativo" value="Ativo" />
                                <Picker.Item label="Inativo" value="Inativo" />
                            </Picker>
                        </View>
                        <TextInput value={title} placeholder="Título" style={styles.input} onChangeText={(title) => { setTitle(title) }}></TextInput>
                        <TextInput value={value} placeholder="Valor" style={styles.input} keyboardType="numeric" onChangeText={(value) => { setValue(value) }}></TextInput>
                        <TextInput value={description} placeholder="Descrição" style={[styles.input, { height: 150, textAlignVertical: "top" }]} onChangeText={(description) => { setDescription(description) }}></TextInput>
                        <TouchableOpacity style={styles.saveButton} onPress={() => { savePromo() }}>
                            <Text style={{ color: "#FFF", fontSize: 18 }}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: height - 50,
        backgroundColor: "#FFF",
        alignItems: "center"
    },
    promosTitle: {
        fontSize: 25,
        width: '90%',
        paddingTop: 15,
        marginBottom: 15
    },
    modalContainer: {
        height: '100%',
        width: '100%'
    },
    modalHeader: {
        height: '20%',
        width: '100%',
        backgroundColor: "#FFF",
        alignItems: "center"
    },
    modalBody: {
        height: '80%',
        width: '100%',
        backgroundColor: '#FFF',
        alignItems: "center"
    },
    input: {
        width: '90%',
        height: 60,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        borderWidth: 1,
        borderRadius: 7.5,
        paddingLeft: 10,
        marginBottom: 25,
        fontSize: 18
    },
    saveButton: {
        width: 200,
        height: 50,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 25
    },
    promosButton: {
        width: width * 0.9,
        height: 60,
        borderBottomWidth: 1,
        backgroundColor: '#FFF',
        flexDirection: "row",
        alignItems: "center"
    },
    usersText: {
        color: '#000',
        fontSize: 20,
        fontWeight: "bold",
        width: '50%'
    },
    deleteButton:{
        backgroundColor: "red",
        left: -10,
        width: 60,
        borderRadius: 5, 
        height: '100%',
        alignItems: "center",
        justifyContent: "center"
    }
})