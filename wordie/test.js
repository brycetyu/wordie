import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MainPage from './App'; 
describe('Navigation for the application',()=>{
  test('Navigation to Game Screen', () => {
    const { getByText } = render(<MainPage/>);
    const trailsButton = getByText('Trails');
    fireEvent.press(trailsButton);
    const gameScreenTitle = getByText('Trails');
    expect(gameScreenTitle).toBeTruthy();
  });

  test('Navigation to Endless Game Screen', () => {
    const { getByText } = render(<MainPage/>);
    const endlessGameButton = getByText('Endless Trails');
    fireEvent.press(endlessGameButton);
    const endlessGameScreenTitle = getByText('Endless Trails');
    expect(endlessGameScreenTitle).toBeTruthy();
  });

  test('Navigation to High Score Screen', () => {
    const { getByText } = render(<MainPage/>);
    const highScoreButton = getByText('High Score');
    fireEvent.press(highScoreButton);
    const highScoreScreenTitle = getByText('High scores');
    expect(highScoreScreenTitle).toBeTruthy();
  });

  test('Navigation to Word of the Day Screen', () => {
    const { getByText } = render(<MainPage/>);
    const wordOfTheDayButton = getByText('Word of the day');
    fireEvent.press(wordOfTheDayButton);
    const wordOfTheDayScreenTitle = getByText('Word for the day');
    expect(wordOfTheDayScreenTitle).toBeTruthy();
  });
})






