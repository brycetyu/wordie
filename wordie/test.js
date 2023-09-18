import React from 'react';
import MainPage from './App'; 

describe('MainPage', () => {
  it('navigate to GameScreen when Trails is pressed', () => {
    const { getByText } = render(<MainPage/>);
    const navigate = jest.fn();

    const trailsButton = getByText('Trails');
    fireEvent.press(trailsButton);

    expect(navigate).toHaveBeenCalledWith('GameScreen');
  });

  it('navigate to EndlessGameScreen when Endless Trails is pressed', () => {
    const { getByText } = render(<MainPage/>);
    const navigate = jest.fn();

    const endlessTrailsButton = getByText('Endless Trails');
    fireEvent.press(endlessTrailsButton);

    expect(navigate).toHaveBeenCalledWith('EndlessGameScreen');
  });

  it('navigate to HighscoreScreen when High Score is pressed', () => {
    const { getByText } = render(<MainPage/>);
    const navigate = jest.fn();

    const endlessTrailsButton = getByText('High Score');
    fireEvent.press(HighScoreScreen);

    expect(navigate).toHaveBeenCalledWith('HighScoreScreen');
  });

  it('navigate to HighscoreScreen when Word of the day is pressed', () => {
    const { getByText } = render(<MainPage/>);
    const navigate = jest.fn();

    const endlessTrailsButton = getByText('Word of the day');
    fireEvent.press(HighScoreScreen);

    expect(navigate).toHaveBeenCalledWith('WordOfTheDayScreen');
  });
  
});