import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import Routes from './routes';

console.disableYellowBox = true;

export default function App(){
	return(
		<>
			<StatusBar backgroundColor="#262630" barStyle="light-content"></StatusBar>
			<Routes></Routes>

		</>
	);
}