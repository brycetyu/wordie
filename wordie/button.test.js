import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MainPage from './App'; 

jest.mock('expo-sqlite', () => ({
    openDatabase: () => ({
      transaction: (callback) => callback({ executeSql: jest.fn() }),
    }),
  }));
describe('Testing of gameplay buttons',()=>{
    //need to run the test till the randomly generated letters appears x for the user input for the letters
    test('update user letter input when Backspace button is pressed', () => {
        const {getByText,getByTestId} = render(<MainPage/>);
        const trailsButton = getByText('Trails');
        fireEvent.press(trailsButton);
        //using x as a placeholder as the letters are randomly generated
        const letterButton = getByText('x');
        //fireevent press 3 times to generate more of a user input
        fireEvent.press(letterButton);
        fireEvent.press(letterButton);
        fireEvent.press(letterButton);
        const backspaceButton = getByText('⌫');
        fireEvent.press(backspaceButton);    
        const inputText = getByText('xx');   
        expect(inputText.props.children).toBe('xx');
    });
    test('update user letter input when Enter button is pressed', () => {
        const {getByText} = render(<MainPage/>);
        const trailsButton = getByText('Trails');
        fireEvent.press(trailsButton);
        const letterButton = getByText('x');
        fireEvent.press(letterButton);
        const enterButton = getByText('Enter');
        fireEvent.press(enterButton);
        const inputText = getByText('');
        expect(inputText.props.children).toBe('');
    });

    test('end round when end game button is pressed', () => {
      const {getByText,queryByText} = render(<MainPage/>);
      const endlesstrailsButton = getByText('Endless Trails');
      fireEvent.press(endlesstrailsButton);
      const endButton = queryByText('End Game');
      fireEvent.press(endButton);
      expect(queryByText('End Game')).toBeNull();
    });
})