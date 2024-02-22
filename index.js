import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  Image,
  SafeAreaView,
  TextInput,
  Pressable,
  Animated,
  Easing,
  TouchableOpacity,
  PanResponder,
  Alert,
  Dimensions,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";

const WINDOW_WIDTH = Dimensions.get("window").width;

const userStories = [
  {
    userId: "1",
    username: "Hoan Nguyen",
    stories: [
      {
        uri: "https://didongviet.vn/dchannel/wp-content/uploads/2023/09/hinh-nen-chill-didongviet-26-1.jpg",
      },
      {
        uri: "https://inkythuatso.com/uploads/thumbnails/800/2022/05/10-hinh-nen-dien-thoai-nhe-nhanh-inkythuatso-19-16-31-42.jpg",
      },
    ],
  },
  {
    userId: "2",
    username: "Rolnadol",
    stories: [
      {
        uri: "https://hoanghamobile.com/tin-tuc/wp-content/uploads/2023/07/hinh-nen-dien-thoai-dep-nhat-hien-nay-6.jpg",
      },
    ],
  },
];

const AnimationStory = ({ route }) => {
  const indexStoryNavigate = route?.params?.index;

  const timeDurationIndicator = 2000;

  const maxValueAnimation = 100;

  const [userIndex, setUserIndex] = useState(indexStoryNavigate || 0);

  const [storyIndex, setStoryIndex] = useState(0);

  const progress = useRef(new Animated.Value(0)).current;

  const rotate = useRef(new Animated.Value(0)).current;

  const [isRunningAnimation, setIsRunningAnimation] = useState(true);

  const lastValueProgress = useRef(0);

  const interpolatedWidth = progress.interpolate({
    inputRange: [lastValueProgress.current, 100],
    outputRange: [`${lastValueProgress.current}%`, "100%"],
  });

  const [position] = useState(new Animated.ValueXY());

  const [isDragRight, setIsDragRight] = useState();

  const interpolatedRotate = rotate.interpolate({
    inputRange: [0, 100],
    outputRange: ["0deg", !!isDragRight ? "10deg" : "-10deg"],
  });

  useEffect(() => {
    if (!isRunningAnimation) {
      progress.stopAnimation((value) => {
        lastValueProgress.current = value;
      });
    } else {
      const timeDuration =
        timeDurationIndicator -
        (lastValueProgress.current / maxValueAnimation) * timeDurationIndicator;
      progress.setValue(lastValueProgress.current);
      Animated.timing(progress, {
        toValue: maxValueAnimation,
        duration: timeDuration,
        useNativeDriver: false,
        easing: Easing.linear,
      }).start();
    }
  }, [isRunningAnimation]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (event, gestureState) => true,
      onPanResponderMove: (event, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
        if (gestureState.dx > 0 && gestureState.dx < 100) {
          setIsDragRight(true);
          rotate.setValue(gestureState.dx);
        } else if (gestureState.dx < 0 && gestureState.dx > -100) {
          setIsDragRight(false);
          rotate.setValue(-gestureState.dx);
        }
      },
      onPanResponderStart: (e, gestureState) => {},
      onPanResponderEnd: (e, gestureState) => {
        if (gestureState.dx == 0 && gestureState.dy == 0) {
          setIsRunningAnimation((prev) => !prev);
        } else {
          if (gestureState.dx <= -100) {
            goToNextUser();
            setStoryIndex(0);
            position.setValue({ x: 0, y: 0 });
          } else if (gestureState.dx >= 100) {
            goToPrevUser();
            setStoryIndex(0);
            position.setValue({ x: 0, y: 0 });
          }
        }
      },
    })
  ).current;

  useEffect(() => {
    progress.addListener(({ value }) => {
      if (value == maxValueAnimation) {
        goToNextStory();
      }
    });
  }, [userIndex, storyIndex]);

  useEffect(() => {
    progress.setValue(lastValueProgress.current);
    rotate.setValue(0);
    Animated.timing(progress, {
      toValue: maxValueAnimation,
      duration: timeDurationIndicator,
      useNativeDriver: false,
      easing: Easing.linear,
    }).start();

    return () => progress.stopAnimation();
  }, [storyIndex, userIndex]);

  const user = userStories?.[userIndex];

  const story = user?.stories?.[storyIndex];

  const goToPrevStory = () => {
    progress?.removeAllListeners();
    lastValueProgress.current = 0;
    setStoryIndex((index) => {
      if (index == 0) {
        goToPrevUser();
        return 0;
      }
      return index - 1;
    });
  };

  const goToNextStory = () => {
    progress?.removeAllListeners();
    lastValueProgress.current = 0;

    setStoryIndex((index) => {
      if (index == user?.stories.length - 1) {
        goToNextUser();
        return 0;
      }
      return index + 1;
    });
  };

  const goToNextUser = () => {
    setTimeout(() => {
      progress?.removeAllListeners();
      setUserIndex((index) => {
        if (index == userStories?.length - 1) {
          return 0;
        }
        return index + 1;
      });
    }, 10);
  };

  const goToPrevUser = () => {
    setUserIndex((index) => {
      if (index == 0) {
        return userStories?.length - 1;
      }
      return index - 1;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.storyContainer}>
        <Animated.View
          style={[
            styles.image,
            {
              // transform: position.getTranslateTransform(),
              transform: [
                { translateX: position.x },
                // {translateY: position.y},
                {
                  rotate: interpolatedRotate,
                },
              ],
              //marginRight: 50,
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Image
            key={userIndex}
            source={{
              uri: userStories[userIndex - 1]?.stories?.[0]?.uri,
            }}
            style={[
              styles.image,
              {
                position: "absolute",
                left: -WINDOW_WIDTH - 50,
              },
            ]}
          />
          <Image
            source={{ uri: userStories[userIndex + 1]?.stories?.[0]?.uri }}
            style={[
              styles.image,
              {
                position: "absolute",
                left: WINDOW_WIDTH + 50,
              },
            ]}
          />

          <Image source={{ uri: story?.uri }} style={styles.image} />
          <Pressable style={styles.navPressable} onPress={goToPrevStory} />

          <Pressable
            style={[styles.navPressable, { right: 0 }]}
            onPress={goToNextStory}
          />
        </Animated.View>

        <View style={styles.header}>
          <View style={styles.indicatorRow}>
            {user?.stories?.map((story, index) => {
              return (
                <View
                  key={`${user.userId}-${index}`}
                  style={styles.indicatorBG}
                >
                  <Animated.View
                    style={[
                      styles.indicator,
                      {
                        width:
                          index === storyIndex
                            ? interpolatedWidth
                            : index < storyIndex
                            ? "100%"
                            : 0,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.username}>{user?.username}</Text>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  storyContainer: {
    flex: 1,
    flexDirection: "row",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  header: {
    position: "absolute",
    top: 0,
    width: "100%",
    padding: 20,
    paddingTop: 15,
    zIndex: 999,
  },
  username: {
    color: "black",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    height: 60,
    backgroundColor: "black",
    zIndex: 999,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    borderRadius: 50,
    width: "100%",
    color: "white",
  },
  navPressable: {
    width: "30%",
    height: "100%",
    position: "absolute",
  },
  indicatorRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  indicator: {
    backgroundColor: "white",
    height: "100%",
  },
  indicatorBG: {
    marginRight: 2,
    flex: 1,
    height: 5,
    backgroundColor: "darkgray",
    overflow: "hidden",
    borderRadius: 10,
  },
});

export default AnimationStory;
