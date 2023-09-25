import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet,TouchableOpacity,ScrollView,FlatList } from 'react-native';
import { NavigationContainer  } from '@react-navigation/native';
import {createStackNavigator}  from '@react-navigation/stack';
import * as SQLite from "expo-sqlite";
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';


async function openDatabase() {
  if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
  }
  await FileSystem.downloadAsync(
    Asset.fromModule(require('./assets/Dictionary.db')).uri,
    FileSystem.documentDirectory + 'SQLite/Dictionary.db'
  );
}
(async () => {
  try {
    await openDatabase();

  } catch (error) {
    console.error("Database initialization failed:", error);
  }
})();
const db = SQLite.openDatabase('Dictionary.db');

const generateRandomAlphabet = (usedLetters) => {
  const alphabets = 'abcdefghijklmnopqrstuvwxyz';
  const availableAlphabets = alphabets.split('').filter(
    alphabet => !usedLetters.includes(alphabet)
  );
  if (availableAlphabets.length === 0) {
    return '';
  }
  const randomIndex = Math.floor(Math.random() * availableAlphabets.length);
  return availableAlphabets[randomIndex];
};

const Stack = createStackNavigator();

const MainPage = ({ navigation }) => {
  const navigateGameScreen = () => {
    navigation.navigate('GameScreen');
  };
  const navigateEndlessGameScreen = () => {
    navigation.navigate('EndlessGameScreen');
  };
  const navigateHighScore = () => {
    navigation.navigate('HighScoreScreen');
  };
  const navigateWordOfTheDay = () => {
    navigation.navigate('WordOfTheDayScreen');
  };
  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <Text style ={styles.mainMenuText}>Wordie</Text>
      </View>
      <TouchableOpacity style = {styles.buttonstyle} onPress={navigateGameScreen}>
            <Text style={styles.buttonText}>Trails</Text>
      </TouchableOpacity>
      <TouchableOpacity style = {styles.buttonstyle} onPress={navigateEndlessGameScreen}>
            <Text style={styles.buttonText}>Endless Trails</Text>
      </TouchableOpacity>
      <TouchableOpacity style = {styles.buttonstyle} onPress={navigateHighScore}>
            <Text style={styles.buttonText}>High Score</Text>
      </TouchableOpacity>
      <TouchableOpacity style = {styles.buttonstyle} onPress={navigateWordOfTheDay}>
            <Text style={styles.buttonText}>Word of the day</Text>
      </TouchableOpacity>
    </View>
  );
};

const GameScreen = () => {
const [selectedLetters, setSelectedLetters] = useState([]);
const [buttons, setButtons] = useState([]);
const [scores, setScores] = useState(0);
const [timer, setTimer] = useState(60);
const [queriedWords, setQueriedWords] = useState([]);
const [enteredWords, setEnteredWords] = useState([]);
const [definitions,setDefinitions] = useState([]);
const [isItAWord,setIsItAWord] = useState('');
useEffect(() => {
  const usedLetters = [];
  const generatedButtons = Array.from({ length: 10 }, (_, index) => {
    const alphabet = generateRandomAlphabet(usedLetters);
    usedLetters.push(alphabet);
    return {
      alphabet, id: index};
  });
  setButtons(generatedButtons);
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    setTimer((prevTimer) => prevTimer - 1);
  }, 1000);

  const handleTimerEnd = async () => {
    try {
      await new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            'INSERT INTO Highscore (highscore, gametype) VALUES (?,?);',
            [scores, 'trails'],
            (_, result) => {
              console.log("Inserted");
              resolve(result);
            },
            (_, err) => {
              console.error("Error executing database query:", err);
              reject(err);
            }
          );
        });
      });
    } catch (error) {
      console.error("Error in database transaction:", error);
    }
  };
  if (timer === 0) {
    handleTimerEnd();
  }
  return () => {
    clearInterval(interval);
  };
}, [timer, scores]);

const handleButtonPress = (alphabet) => {
    const updatedLetters = [...selectedLetters, alphabet];
    setSelectedLetters(updatedLetters);
};

const handleEnterPress = async () => {
  const combinedLetter = selectedLetters.join('');
    if (queriedWords.includes(combinedLetter)) {
      setIsItAWord('You had tried this word');
      setSelectedLetters([]); 
      return;
    }
  try {
    await new Promise((resolve, reject) => {
      db.transaction((tx) => 
      {
        tx.executeSql(
          'SELECT * FROM entries WHERE word like ?',[combinedLetter],
          (_, results) => {
            console.log('Query results:', results.rows);
            if (results.rows.length > 0) {
              const wordData = results.rows.item(0); 
              const { word, definition } = wordData;
              const wordScore = combinedLetter.length * 10;
              setScores(scores + wordScore);
              setEnteredWords((prevWords) => [...prevWords, word]);
              setQueriedWords((prevQueriedWords) => [...prevQueriedWords, combinedLetter]);
              setDefinitions((prevDefinitions) => [...prevDefinitions, definition]);
              setIsItAWord('');
            } else {
              setIsItAWord('It is not a word or does not exist in our data');
            }
            resolve(); 
          },
          (error) => {
            console.error('Error executing database query:', error);
            reject(error); 
          }
        );
      });
    });
    setSelectedLetters([]);
  } catch (error) {
    console.error('Error in handleEnterPress:', error);
  }
};

const handleBackspacePress = () => {
  const updatedLetters = [...selectedLetters];
  updatedLetters.pop();
  setSelectedLetters(updatedLetters);
};

const displayedAlphabets = buttons.map((button) => button.alphabet).join(' ');

const renderScoreUI = () => {
  return (
    <View style={styles.scoreUI}>
      <Text style={styles.finalScoreText}>Final Score:</Text>
      <Text style={styles.finalScore}>{scores}</Text>
      <Text style={styles.enteredWordsText}>Entered Words:</Text>
      <ScrollView>      
      {enteredWords.map((word, index) => (
      <Text key={word} style={styles.enteredWord}>
        {word} : {definitions[index]}
      </Text>
      ))}
      </ScrollView>
    </View>
  );
};
  return (

    <View style={styles.container}>
      {timer > 0 ? (
        <>
      <View style={styles.buttonRow}>
        <Text style={styles.title}>Wordie</Text>
      </View>      
      <View style={styles.buttonRow}>
        <Text style={styles.timer}>Time Left : {timer}</Text>
      </View>
      <View style={styles.buttonRow}>
        <Text style={styles.score}>Score: {scores}</Text>
      </View>
      <View style={styles.buttonRow}>
        <Text style={styles.displayedAlphabets}>{displayedAlphabets.toLocaleUpperCase()}</Text> 
      </View>
      <View style={styles.buttonRow}>
      <Text style={styles.displayedAlphabets}>{selectedLetters.join('')}</Text>
      </View>
      <View style={styles.buttonRow}>
          {buttons.slice(0, 5).map((button) => (
            <TouchableOpacity key={button.id} style = {styles.alphabetButton}
                onPress={() => handleButtonPress(button.alphabet)} >
                  <Text style={styles.buttonText}>
                  {button.alphabet}
                  </Text>
            </TouchableOpacity>
          ))}
      </View>
      <View style={styles.buttonRow}>
      {buttons.slice(5).map((button) => (
          <TouchableOpacity key={button.id} style = {styles.alphabetButton}
              onPress={() => handleButtonPress(button.alphabet)} >
                <Text style={styles.buttonText}>
                {button.alphabet}
                </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.buttonRow}>
          <TouchableOpacity style = {styles.buttonstyle} onPress={() => handleBackspacePress()}>
            <Text style={styles.buttonText}>⌫</Text>
            </TouchableOpacity>
            <TouchableOpacity style = {styles.buttonstyle} onPress={() => handleEnterPress()}>
            <Text style={styles.buttonText}>Enter</Text>
            </TouchableOpacity>
      </View>
      <View style={styles.buttonRow}>
        <Text style={{...styles.enteredWord, alignItems:'center'}}>{isItAWord}</Text>
      </View>
      
      <ScrollView>
      {enteredWords.map((word) => (
          <Text key={word} style={styles.enteredWord}>{word}</Text>
        ))}
      </ScrollView>
      </>
      ) : (
        renderScoreUI()
      )}
    </View>
  );
};

const EndlessGameScreen = () => {
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [buttons, setButtons] = useState([]);
  const [scores, setScores] = useState(0);
  const [queriedWords, setQueriedWords] = useState([]);
  const [enteredWords, setEnteredWords] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [isItAWord, setIsItAWord] = useState('');
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const usedLetters = [];
    const generatedButtons = Array.from({ length: 10 }, (_, index) => {
      const alphabet = generateRandomAlphabet(usedLetters);
      usedLetters.push(alphabet);
      return { alphabet, id: index };
    });
    setButtons(generatedButtons);
  }, []);

  const handleButtonPress = (alphabet) => {
    const updatedLetters = [...selectedLetters, alphabet];
    setSelectedLetters(updatedLetters);
  };

  const handleEnterPress = async () => {
    const combinedLetter = selectedLetters.join('');

    if (queriedWords.includes(combinedLetter)) {
      setIsItAWord('You had tried this word');
      setSelectedLetters([]); 
      return;
    }
    try {
      await new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            'SELECT * FROM entries WHERE word like ?',
            [combinedLetter],
            (_, results) => {
              console.log('Query results:', results.rows);
              if (results.rows.length > 0) {
                const wordData = results.rows.item(0);
                const { word, definition } = wordData;
                const wordScore = combinedLetter.length * 10;
                setScores(scores + wordScore);
                setEnteredWords((prevWords) => [...prevWords, word]);
                setQueriedWords((prevQueriedWords) => [
                  ...prevQueriedWords,
                  combinedLetter,
                ]);
                setDefinitions((prevDefinitions) => [...prevDefinitions, definition]);
                setIsItAWord('');
              } else {
                setIsItAWord('It is not a word or does not exist in our data');
              }
              resolve(); 
            },
            (error) => {
              console.error('Error executing database query:', error);
              reject(error); 
            }
          );
        });
      });
      setSelectedLetters([]);
    } catch (error) {
      console.error('Error in handleEnterPress:', error);
    }
  };

  const handleRoundEnd = async () => {
    try {
      await new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            'INSERT INTO Highscore (highscore, gametype) VALUES (?,?);',
            [scores, 'Endless trails'],
            (_, result) => {
              console.log("Inserted");
              resolve(result);
            },
            (_, err) => {
              console.error("Error executing database query:", err);
              reject(err);
            }
          );
        });
      });
    } catch (error) {
      console.error("Error in database transaction:", error);
    }
  };
  if (gameOver == true) {
    handleRoundEnd();
  }

  const handleBackspacePress = () => {
    const updatedLetters = [...selectedLetters];
    updatedLetters.pop();
    setSelectedLetters(updatedLetters);
  };

  const displayedAlphabets = buttons.map((button) => button.alphabet).join(' ');

  const renderScoreUI = () => {
    return (
      <View style={styles.scoreUI}>
        <Text style={styles.finalScoreText}>Final Score:</Text>
        <Text style={styles.finalScore}>{scores}</Text>
        <Text style={styles.enteredWordsText}>Entered Words:</Text>
        <ScrollView>
          {enteredWords.map((word, index) => (
            <Text key={word} style={styles.enteredWord}>
              {word} : {definitions[index]}
            </Text>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!gameOver ? (
        <>
          <View style={styles.buttonRow}>
            <Text style={styles.title}>Wordie</Text>
          </View>
          <View style={styles.buttonRow}>
        <Text style={styles.score}>Score: {scores}</Text>
      </View>
      <View style={styles.buttonRow}>
        <Text style={styles.displayedAlphabets}>{displayedAlphabets.toLocaleUpperCase()}</Text> 
      </View>
      <View style={styles.buttonRow}>
      <Text  style={styles.displayedAlphabets}>{selectedLetters.join('')}</Text>
      </View>
      <View style={styles.buttonRow}>
          {buttons.slice(0, 5).map((button) => (
            <TouchableOpacity key={button.id} style = {styles.alphabetButton}
                onPress={() => handleButtonPress(button.alphabet)} >
                  <Text style={styles.buttonText}>
                  {button.alphabet}
                  </Text>
            </TouchableOpacity>
          ))}
      </View>
      <View style={styles.buttonRow}>
      {buttons.slice(5).map((button) => (
          <TouchableOpacity key={button.id} style = {styles.alphabetButton}
              onPress={() => handleButtonPress(button.alphabet)} >
                <Text style={styles.buttonText}>
                {button.alphabet}
                </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.buttonRow}>
          <TouchableOpacity style = {styles.buttonstyle} onPress={() => handleBackspacePress()}>
            <Text style={styles.buttonText}>⌫</Text>
            </TouchableOpacity>
            <TouchableOpacity style = {styles.buttonstyle} onPress={() => handleEnterPress()}>
            <Text style={styles.buttonText}>Enter</Text>
            </TouchableOpacity>
      </View>
      <View style={styles.buttonRow}>
        <Text style={{...styles.enteredWord, alignItems:'center'}}>{isItAWord}</Text>
      </View>
      
      <ScrollView>
      {enteredWords.map((word) => (
          <Text key={word} style={styles.enteredWord}>{word}</Text>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.buttonstyle}
        onPress={() => setGameOver(true)}
      >
        <Text style={styles.buttonText}>End Game</Text>
      </TouchableOpacity>
        </>
      ) : (
        renderScoreUI()
      )}
    </View>
  );
};

const HighScoreScreen = () => {
  const [trailsHighScores, setTrailsHighScores] = useState([]);
  const [endlessTrailsHighScores, setEndlessTrailsHighScores] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT gametype, highscore FROM highscore WHERE gametype IN (?, ?) ORDER BY gametype, highscore DESC LIMIT 5',
        ['trails', 'Endless trails'],
        (_, { rows }) => {
          const data = rows._array;
          const trailsData = data.filter((item) => item.gametype === 'trails');
          const endlessTrailsData = data.filter(
            (item) => item.gametype === 'Endless trails'
          );
          setTrailsHighScores(trailsData);
          setEndlessTrailsHighScores(endlessTrailsData);
          setLoading(false);
        },
        (_, error) => {
          console.error('Error executing database query:', error);
        }
      );
    });
  }, []);
  
  return (
    <View style={styles.highscorecontainer}>
      <Text style={styles.highScoresText}>High scores</Text>
      <Text style={styles.highScoresText}>Trails:</Text>
      {loading ? (
      <Text>Loading your Highscores</Text>
      ) : 
      trailsHighScores.length === 0 ? (
        <Text>No high scores for Trails at the moment.</Text>
      ) : (
        trailsHighScores.map((score, index) => (
          <Text key={index} style={styles.highscoreText}>
            {index + 1}: {score.highscore}
          </Text>
        ))
      )}
      <Text style={styles.highScoresText}>Endless Trails:</Text>
      {loading ? (
        <Text>Loading your Highscores</Text>
      ) : endlessTrailsHighScores.length === 0 ? (
        <Text>No high scores for Endless Trails at the moment.</Text>
      ) : (
        endlessTrailsHighScores.map((score, index) => (
          <Text key={index} style={styles.highscoreText}>
            {index + 1}: {score.highscore}
          </Text>
        ))
      )}
    </View>
  );
};

const WordOfTheDayScreen = () => {
  const [enteredWord, setEnteredWord] = useState('');
  const [definition,setDefinition] = useState('');
  const [wordLoaded, setWordLoaded] = useState(false); 

  useEffect(() => {
    if (!wordLoaded) {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM entries ORDER BY RANDOM() LIMIT 1;',
          [],
          (_, results) => {
            if (results.rows.length > 0) {
              const wordData = results.rows.item(0);
              const { word, definition } = wordData;
              setEnteredWord(word);
              setDefinition(definition);
              setWordLoaded(true); 
            }
          },
          (_, error) => {
            console.error('Error executing SQL query:', error);
          }
        );
      });
    }
  }, [wordLoaded]); 
  
  return (
    <View style={styles.highscorecontainer}>
      <Text style={styles.highScoresText}>Word of the day</Text>
      <Text style={styles.highScoreText}>Word : {enteredWord}</Text>
      <Text style={styles.highScoreText}>Meaning : {definition}</Text>
    </View>
  );
};


export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MainPage" component={MainPage} options={{ title: "Wordie", headerTitleAlign: "center" }}/>
        <Stack.Screen name="GameScreen" component={GameScreen} options={{ title: "Trails", headerTitleAlign: "center" }} />
        <Stack.Screen name="EndlessGameScreen" component={EndlessGameScreen} options={{ title: "Endless Trails", headerTitleAlign: "center" }} />
        <Stack.Screen name="HighScoreScreen" component={HighScoreScreen} options={{ title: "High score", headerTitleAlign: "center" }} />
        <Stack.Screen name="WordOfTheDayScreen" component={WordOfTheDayScreen} options={{ title: "Word for the day", headerTitleAlign: "center" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent:'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  highscorecontainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems:'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  mainMenuText:{
    fontSize:24,
    fontWeight: 'bold',
    justifyContent:'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    flexDirection:'row',
    justifyContent:'center'
  },
 buttonRow: {
    flexDirection: 'row',
    justifyContent: "center",
    marginBottom: 10,
  },
  buttonstyle:{
    borderRadius:10,
    borderWidth:2,
    paddingLeft:20,
    paddingRight:20,
    paddingTop:10,
    paddingBottom:5,
    marginLeft:10,
    marginRight:10
  },
  buttonText:{
    textAlign:'center',
    textAlignVertical:'center',
    fontSize:30
  },
  alphabetButton:{
      borderRadius:60,
      borderWidth:2,
      borderColor:'black',
      alignContent:'center',
      paddingLeft:15,
      paddingRight:15,
      paddingTop:5,
      paddingBottom:5,
      marginLeft:10,
      marginRight:10
    },

  displayedAlphabets: {
    fontSize: 18,
    marginBottom: 10,
    justifyContent:'center'
  },

  score: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },  
  scoreUI: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  finalScoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  finalScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },  
  enteredWordsText: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: 'bold',
  },
  enteredWord: {
    fontSize: 16,
    marginTop: 10,
  },
  highScoresText: {
    fontSize: 24, 
    fontWeight: 'bold',
    paddingBottom:20,
    paddingTop:10
  },
  highscoreText: {
    fontSize: 16,
  },


});