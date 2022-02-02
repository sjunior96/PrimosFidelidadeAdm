import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, ToastAndroid, TextInput, TouchableOpacity, Modal, Picker } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase from '../../Services/firebaseConnection';
import { FlatList } from 'react-native-gesture-handler';

import Swipeable from 'react-native-gesture-handler/Swipeable';

const { width, height } = Dimensions.get('window');

import AwesomeAlert from 'react-native-awesome-alerts';

export default function Promos() {

    const [modalVisible, setModalVisible] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [promoStatus, setPromoStatus] = useState("Ativo");
    const [title, setTitle] = useState("");
    const [value, setValue] = useState(parseFloat(0).toFixed(2).toString().replace(".", ","));
    const [description, setDescription] = useState("");
    const [promos, setPromos] = useState([]);
    const [selectedPromoUID, setSelectedPromoUID] = useState("");
    const [filteredPromos, setFilteredPromos] = useState([]);
    const [searchTextPromo, setSearchTextPromo] = useState("");

    const showToastWithGravity = (message) => { //Componente para exibir o Toast
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
        );
    };

    function RightActions({ progress, dragX, promoUID }) { //Botão que será renderizado ao lado do Swipeable

        const scale = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp'
        });

        return (
            <TouchableOpacity onPress={() => { setAlertVisible(true); setSelectedPromoUID(promoUID); }}>
                <View style={styles.rightActionButton}>
                    <Icon name="trash" size={30} color={'#FFF'}></Icon>
                </View>
            </TouchableOpacity>
        );
    }

    async function deletePromo(promoUID) {
        await firebase.database().ref('promos').child(promoUID).remove()
            .then((success) => {
                showToastWithGravity("Serviço excluído com sucesso!");
            })
            .catch((error) => {
                alert("Erro ao deletar serviço: " + JSON.stringify(error));
            });
        getPromos();
    }

    async function openSelectedPromo(promoUID) {
        await firebase.database().ref('promos').child(promoUID).once("value", (snapshot) => {
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
        //getPromos();
    }

    async function getPromos() {
        firebase.database().ref('promos').orderByChild("value").on("value", (snapshot) => {
            setPromos([]);
            snapshot.forEach((childItem) => {
                let list = {
                    key: childItem.key,
                    title: childItem.val().title,
                    value: parseFloat(childItem.val().value).toFixed(2),
                    description: childItem.val().description,
                    promoStatus: childItem.val().promoStatus
                };
                setPromos(oldArray => [...oldArray, list]);
            });
        });
    }

    async function savePromo() {
        if (selectedPromoUID == "") {
            let newPromoKey = firebase.database().ref('promos').push().key;
            await firebase.database().ref('promos').child(newPromoKey).set({
                title: title,
                value: parseFloat(value).toFixed(2).toString().replace(".", ","),
                description: description,
                promoStatus: promoStatus
            }).then((success) => {
                showToastWithGravity("Serviço cadastrado com sucesso!");
                clearForm();
            }).catch((error) => {
                alert(JSON.stringify(error));
            });
        }
        else {
            await firebase.database().ref('promos').child(selectedPromoUID).set({
                title,
                value: parseFloat(value).toFixed(2).toString().replace(".", ","),
                promoStatus,
                description
            }).then((success) => {
                showToastWithGravity("Serviço atualizada com sucesso!");
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
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.promosTitle}>Catálogo de Serviços</Text>
            <View style={{ width: '90%', height: 60, alignItems: "center", justifyContent: "center", flexDirection: "row", borderWidth: 1, borderRadius: 7.5, paddingLeft: 10, marginBottom: 25 }}>
                <View style={{ width: '55%' }}>
                    <TextInput value={searchTextPromo} placeholder="Buscar Serviço..." style={{ fontSize: 18 }} onChangeText={(searchTextPromo) => { setSearchTextPromo(searchTextPromo); }}></TextInput>
                </View>
                <TouchableOpacity style={{ width: '15%', alignItems: "center" }} onPress={() => { searchPromo(); }}>
                    <Icon name="search-outline" size={40} color={"#000"}></Icon>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: '15%', alignItems: "center" }} onPress={() => { clearFilteredPromos(); }}>
                    <Icon name="return-down-back-outline" size={40} color={"#000"}></Icon>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: '15%', alignItems: "center" }} onPress={() => { setModalVisible(true); }}>
                    <Icon name="add-outline" size={40} color={"#000"}></Icon>
                </TouchableOpacity>
            </View>

            <View style={{ width: '90%', alignItems: "flex-end" }}>
                <Text style={{ fontSize: 16 }}>Foram encontrados <Text style={{ fontWeight: "bold" }}>{filteredPromos.length > 0 ? filteredPromos.length : promos.length}</Text> serviços</Text>
            </View>

            <ScrollView>
                <FlatList
                    style={{ height: height - 300 }}
                    contentContainerStyle={{ width: width, paddingLeft: 20 }}
                    data={filteredPromos.length > 0 ? filteredPromos : promos}
                    renderItem={({ item }) => (
                        // Componente que será renderizado para cada usuário cadastrado
                        <Swipeable
                            renderRightActions={(progress, dragX) => (<RightActions progress={progress} dragX={dragX} promoUID={item.key}></RightActions>)}
                        >
                            <TouchableOpacity style={styles.promosButton} onPress={() => { openSelectedPromo(item.key); }}>
                                <Text style={[styles.usersText, { fontSize: 20, width: '70%' }]}>{item.title}</Text>
                                <Text style={[styles.usersText, { color: "#428BCA", textAlign: "right", width: '30%' }]}>R$ {parseFloat(item.value).toFixed(2).toString().replace(".", ",")}</Text>
                            </TouchableOpacity>
                        </Swipeable>
                    )}
                    keyExtractor={item => item.id}
                    ItemSeparatorComponent={() => <View style={{ flex: 1, height: 1, backgroundColor: '#DDD' }}></View>}
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
                        <TouchableOpacity style={{ width: '100%', alignItems: "center" }} onPress={() => { clearForm(); }}>
                            <Icon name="arrow-down-circle-outline" size={50} color={"#000"}></Icon>
                        </TouchableOpacity>
                        {selectedPromoUID.length > 0 ?
                            (<Text style={{ fontSize: 25 }}>Editar Serviço</Text>)
                            :
                            (<Text style={{ fontSize: 25 }}>Novo Serviço</Text>)
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
                        <TextInput value={title} placeholder="Título" style={styles.input} onChangeText={(title) => { setTitle(title); }}></TextInput>
                        <TextInput value={value} placeholder="Valor" style={styles.input} keyboardType="numeric" onChangeText={(value) => { setValue(value); }}></TextInput>
                        <TextInput multiline value={description} placeholder="Descrição" style={[styles.input, { height: 150, textAlignVertical: "top" }]} onChangeText={(description) => { setDescription(description); }}></TextInput>
                        <TouchableOpacity style={styles.saveButton} onPress={() => { savePromo(); }}>
                            <Text style={{ color: "#FFF", fontSize: 18 }}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <AwesomeAlert
                show={alertVisible}
                showProgress={false}
                title="Atenção"
                message={"Tem certeza de que deseja apagar este serviço? Esta operação não pode ser desfeita!"}
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={true}
                showConfirmButton={true}
                cancelText="Não"
                confirmText="Sim"
                confirmButtonColor="#DD6B55"
                cancelButtonColor="#000"
                onCancelPressed={() => {
                    setAlertVisible(false);
                    setSelectedPromoUID("");
                    clearForm();
                }}
                onConfirmPressed={() => {
                    deletePromo(selectedPromoUID);
                    clearForm();
                    //setSelectedPromoUID("");
                    setAlertVisible(false);
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
        width: '90%',
        height: 30,
        backgroundColor: '#FFF',
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 25
    },
    usersText: {
        color: '#000',
        fontSize: 20,
        fontWeight: "bold"
    },
    deleteButton: {
        backgroundColor: "red",
        left: -10,
        width: 60,
        borderRadius: 5,
        height: '100%',
        alignItems: "center",
        justifyContent: "center"
    },
    rightActionButton: {
        height: '100%',
        padding: 20,
        alignItems: "center",
        backgroundColor: '#FF0000',
        justifyContent: "center"
    },
});