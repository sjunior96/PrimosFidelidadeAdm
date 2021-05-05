import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Animated,
    TouchableOpacity,
    Image,
    ToastAndroid,
    KeyboardAvoidingView,
    StyleSheet,
    Keyboard
} from 'react-native';
import Swiper from 'react-native-swiper';

import firebase from '../../Services/firebaseConnection';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [offset] = useState(new Animated.ValueXY({ x: 0, y: 95 }));
    const [opacity] = useState(new Animated.Value(0));
    const [logo] = useState(new Animated.ValueXY({ x: 280, y: 258 }));

    const showToastWithGravity = (message) => {
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
        );
    };

    async function resetPassword() {
        firebase.auth().sendPasswordResetEmail(email)
            .then((success) => {
                showToastWithGravity("Email de redefinição enviado!");
            })
    }

    async function loginUser() {
        if (email != "" && password != "") {
            firebase.auth().signInWithEmailAndPassword(email, password)
                .catch((error) => {
                    alert(error);
                });
        }
        else {
            showToastWithGravity("Preencha todos os campos!");
        }
    }

    async function registerUser() {
        await firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(() => {
                let uid = firebase.auth().currentUser.uid;
                firebase.database().ref("users").child(uid).set({
                    email: email,
                    name: name,
                    giftsQuantity: 0,
                    stampsQuantity: 0,
                    clientType: "Cliente"
                })
                    .catch((error) => {
                        alert(error.code);
                    });
            })
    }

    useEffect(() => {
        keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
        keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', keyboardDidHide);

        Animated.parallel([
            Animated.spring(offset.y, {
                toValue: 0,
                speed: 1,
                bounciness: 15
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: false
            })
        ]).start();
    }, [])

    function keyboardDidShow() {
        Animated.parallel([
            Animated.timing(logo.x, {
                toValue: 55,
                duration: 100,
                useNativeDriver: false
            }),
            Animated.timing(logo.y, {
                toValue: 65,
                duration: 100,
                useNativeDriver: false
            })
        ]).start();
    }

    function keyboardDidHide() {
        Animated.parallel([
            Animated.timing(logo.x, {
                toValue: 280,
                duration: 100,
                useNativeDriver: false
            }),
            Animated.timing(logo.y, {
                toValue: 258,
                duration: 100,
                useNativeDriver: false
            })
        ]).start();
    }

    return (
        <KeyboardAvoidingView style={styles.background}>
            <View style={styles.containerLogo}>
                <Animated.Image
                    style={{ width: logo.x, height: logo.y }}
                    source={require('../../assets/logo2.png')} style={{ resizeMode: "contain", height: '100%' }}
                />
            </View>

            <Animated.View
                style={[
                    styles.container,
                    {
                        opacity: opacity,
                        transform: [
                            { translateY: offset.y }
                        ]
                    }
                ]}
            >

                <Swiper
                    style={{ marginLeft: '5%' }}
                    //showsButtons={true} 
                    //nextButton={<Text style={{ color: '#00F', left: -20 }}>{">>"}</Text>} 
                    //prevButton={<Text style={{ color: '#00F', left: 20 }}>{"<<"}</Text>}
                    showsPagination={true}
                    paginationStyle={{
                        top: 200
                    }}
                    activeDotColor={'#FFF'}
                    dotColor={"gray"}
                >
                    {/* SLIDE 1 - LOGIN DO ADMINISTRADOR */}
                    <View style={{ paddingBottom: 50 }}>
                        <Text style={{ fontSize: 30, color: "#FFF", width: '90%', textAlign: "center", marginBottom: 10 }}>Login</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            autoCorrect={false}
                            onChangeText={(email) => { setEmail(email) }}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Senha"
                            autoCorrect={false}
                            onChangeText={(password) => { setPassword(password) }}
                            secureTextEntry={true}
                        />

                        <TouchableOpacity
                            style={styles.btnSubmit}
                            onPress={() => { loginUser() }}
                        >
                            <Text style={styles.submitText}>Entrar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* SLIDE 2 - REDEFINIÇÃO DE SENHA */}
                    <View>
                        <Text style={{ fontSize: 30, color: "#FFF", width: '90%', textAlign: "center", marginBottom: 10 }}>Redefinição</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            autoCorrect={false}
                            onChangeText={(email) => { setEmail(email) }}
                        />

                        <TouchableOpacity style={styles.btnSubmit}>
                            <Text style={styles.submitText}>Entrar</Text>
                        </TouchableOpacity>
                    </View>
                </Swiper>

            </Animated.View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: '#191919'
    },
    containerLogo: {
        flex: 1,
        justifyContent: "center"
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: '90%',
        paddingBottom: 75
    },
    input: {
        backgroundColor: '#FFF',
        width: '90%',
        marginBottom: 15,
        color: '#222',
        fontSize: 17,
        borderRadius: 7,
        padding: 10
    },
    btnSubmit: {
        backgroundColor: '#35AAFF',
        width: '90%',
        height: 45,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 7
    },
    submitText: {
        color: '#FFF',
        fontSize: 18
    },
    btnRegister: {
        width: '90%',
        marginTop: 10
    },
    registerText: {
        color: "#FFF",
        textAlign: "center"
    }


})