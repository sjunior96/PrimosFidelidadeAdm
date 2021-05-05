import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './Services/RootNavigation.js';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Login from './Pages/Login';
import Home from './Pages/Home';
import Promos from './Pages/Promos';
import About from './Pages/About';

import Icon from 'react-native-vector-icons/FontAwesome5';
import { TouchableOpacity, Image, View, ActivityIndicator } from 'react-native';

import firebase from './Services/firebaseConnection';

const LoginStack = createStackNavigator();
const BottomTab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const PromosStack = createStackNavigator();
const AboutStack = createStackNavigator();

function LoadingScreen() {
	return (
		<View
			style={{
				height: '100%',
				width: '100%',
				backgroundColor: '#000',
				alignItems: "center",
				justifyContent: "center"
			}}>
			<ActivityIndicator size="large" color="#FFF" />
		</View>
	);
}

export default function LoginNavigator(route) {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			setIsLoggedIn(true);
			setIsLoading(false);
		}
		else {
			setIsLoggedIn(false);
			setIsLoading(false);
		}
	});

	return (
		<NavigationContainer ref={navigationRef}>
			<LoginStack.Navigator headerMode="screen">
				{isLoading ?
					(
						<>
							<LoginStack.Screen name="LoadingScreen" component={LoadingScreen} options={{ headerShown: false }}></LoginStack.Screen>
						</>
					) : (
						<></>
					)
				}

				{isLoggedIn ?
					(
						<LoginStack.Screen name="HomeBottomTab" component={Routes} options={{ headerShown: false }}></LoginStack.Screen>
					)
					:
					(
						<>
							<LoginStack.Screen name="Login" component={Login} options={{ headerShown: false }}></LoginStack.Screen>
						</>
					)
				}
			</LoginStack.Navigator>
		</NavigationContainer>
	);
}

function Routes({ navigation }) {
	return (
		<BottomTab.Navigator
			lazy={true}
			tabBarOptions={{
				style: {
					height: 55,
					borderTopWidth: 1
				},
				activeTintColor: '#000',
				inactiveTintColor: 'gray',
				labelStyle: { fontSize: 16 }
			}}>
			<BottomTab.Screen
				name="Home"
				options={{
					tabBarIcon: ({ color, size }) => (
						<Icon name="home" color={color} size={size} />
					),
				}}
			>
				{() => (
					<HomeStack.Navigator>
						<HomeStack.Screen
							name="Home"
							component={Home}
							options={{
								headerTitleAlign: "center",
								headerTitleStyle: { color: '#FFF', fontSize: 30 },
								headerStyle: {
									backgroundColor: '#000'
								},
								headerLeft: () => (
									<Image style={{ width: 50, height: 50 }} source={require('./assets/logo.png')}></Image>
								),
								headerRight: () => (
									<Image style={{ width: 50, height: 50 }} source={require('./assets/logo.png')}></Image>
								),
							}}>
						</HomeStack.Screen>
					</HomeStack.Navigator>
				)}
			</BottomTab.Screen>

			<BottomTab.Screen
				name="Promos"
				options={{
					tabBarLabel: "Serviços",
					tabBarIcon: ({ color, size }) => (
						<Icon name="book-open" color={color} size={size} />
					),
				}}
			>
				{() => (
					<PromosStack.Navigator
						screenOptions={{
							headerTitleAlign: "center",
							headerTitleStyle: { color: '#FFF', fontSize: 30 },
							headerStyle: {
								backgroundColor: '#000'
							}
						}}>
						<PromosStack.Screen
							name="Serviços"
							component={Promos}
							options={{
								headerTitleAlign: "center",
								headerTitleStyle: { color: '#FFF', fontSize: 30 },
								headerStyle: {
									backgroundColor: '#000'
								},
								headerLeft: () => (
									<Image style={{ width: 50, height: 50 }} source={require('./assets/logo.png')}></Image>
								),
								headerRight: () => (
									<Image style={{ width: 50, height: 50 }} source={require('./assets/logo.png')}></Image>
								),
							}}>
						</PromosStack.Screen>
					</PromosStack.Navigator>
				)}
			</BottomTab.Screen>

			<BottomTab.Screen
				name="About"
				options={{
					tabBarLabel: "Sair",
					tabBarIcon: ({ color, size }) => (
						<Icon name="sign-out-alt" color={color} size={size} />
					),
				}}
			>
				{() => (
					<AboutStack.Navigator
						screenOptions={{
							headerTitleAlign: "center",
							headerTitleStyle: { color: '#FFF', fontSize: 30 },
							headerStyle: {
								backgroundColor: '#000'
							}
						}}>
						<AboutStack.Screen
							name="About"
							component={About}
							options={{
								headerShown: false,
								headerTitleAlign: "center",
								headerTitleStyle: { color: '#FFF', fontSize: 30 },
								headerStyle: {
									backgroundColor: '#000'
								},
								headerLeft: () => (
									<Image style={{ width: 50, height: 50 }} source={require('./assets/logo.png')}></Image>
								),
								headerRight: () => (
									<Image style={{ width: 50, height: 50 }} source={require('./assets/logo.png')}></Image>
								),
							}}>
						</AboutStack.Screen>
					</AboutStack.Navigator>
				)}
			</BottomTab.Screen>
		</BottomTab.Navigator >
	);
}