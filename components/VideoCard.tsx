import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React, { useMemo, useState } from "react";
import { icons } from "@/constants";
import { ResizeMode, Video } from "expo-av";
import { SavedEnum, VideoType } from "@/types";
import useAppwrite from "@/lib/useAppwrite";
import { getUserSavedPosts, userSavedPosts } from "@/lib/appwrite";
import { useGlobalContext } from "@/context/GlobalProvider";

type VideoCardProps = {
  video: VideoType;
  afterActionHandler?: () => void;
};

const VideoCard = ({
  video: {
    $id,
    title,
    thumbnail,
    video,
    creator: { username, avatar },
  },
  afterActionHandler,
}: VideoCardProps) => {
  const { user } = useGlobalContext();
  const [play, setPlay] = useState(false);

  const {
    data: posts,
    refetch,
    isLoading,
  } = useAppwrite(() => getUserSavedPosts(""));

  const userBookmarks = useMemo(() => {
    return posts.map((post) => post.$id);
  }, [posts]);

  const confirmHanlder = () => {
    let confirmTitle = "";
    let confirmMessage = "";
    let onPressCancel = () => console.log("Cancel Pressed");
    let onPressOk;
    if (userBookmarks.indexOf($id) !== -1) {
      confirmTitle = "Already in your bookmark";
      confirmMessage = "Are you want to remove it?";
      onPressOk = async () => {
        try {
          await userSavedPosts(user.$id, SavedEnum.REMOVE, $id);
          await refetch();
        } catch (error: any) {
          Alert.alert("ERROR", "Remove bookmark");
        } finally {
          if (afterActionHandler) {
            console.log("afterActionHandler");
            afterActionHandler();
          }
        }
      };
    } else {
      confirmTitle = "Bookmark";
      confirmMessage = "Add into your bookmark?";
      onPressOk = async () => {
        try {
          await userSavedPosts(user.$id, SavedEnum.ADD, $id);
          await refetch();
        } catch (error: any) {
          Alert.alert("ERROR", "Add bookmark");
        } finally {
          if (afterActionHandler) {
            afterActionHandler();
          }
        }
      };
    }

    Alert.alert(confirmTitle, confirmMessage, [
      {
        text: "Cancel",
        onPress: onPressCancel,
        style: "cancel",
      },
      {
        text: "OK",
        onPress: onPressOk,
      },
    ]);
  };
  return (
    <View className="flex-col items-center px-4 mb-14">
      <View className="flex-row gap-3 items-start">
        <View className="justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>
          <View className="justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="text-white font-psemibold text-sm"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text className="text-xs text-gray-100 font-pregular">
              {username}
            </Text>
          </View>
        </View>
        <View className="pt-2">
          <TouchableOpacity activeOpacity={0.7} onPress={confirmHanlder}>
            {userBookmarks.indexOf($id) > -1 ? (
              <Image
                source={icons.bookmark}
                className="w-5 h-5"
                resizeMode="contain"
              />
            ) : (
              <Image
                source={icons.plus}
                className="w-5 h-5"
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {play ? (
        <Video
          source={{ uri: video }}
          className="w-full h-60 rounded-xl mt-3"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(playbackStatus) => {
            if (playbackStatus.isLoaded) {
              if (playbackStatus.didJustFinish) {
                setPlay(false);
              }
            }
          }}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;
