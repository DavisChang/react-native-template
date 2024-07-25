import { useLocalSearchParams } from "expo-router";
import EmptyState from "@/components/EmptyState";
import SearchInput from "@/components/SearchInput";
import VideoCard from "@/components/VideoCard";
import { getUserSavedPosts } from "@/lib/appwrite";
import React, { useEffect, useState } from "react";
import { FlatList, Text, View, RefreshControl } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import useAppwrite from "@/lib/useAppwrite";
import { useGlobalContext } from "@/context/GlobalProvider";

const Bookmark = () => {
  const { user } = useGlobalContext();
  const { query } = useLocalSearchParams();

  let queryString: string;
  if (typeof query === "string") {
    queryString = query;
  } else if (Array.isArray(query)) {
    queryString = query.join(",");
  } else {
    queryString = "";
  }

  const {
    data: posts,
    refetch,
    isLoading,
  } = useAppwrite(() => getUserSavedPosts(queryString));

  useEffect(() => {
    console.log("did mount");
  }, []);

  useEffect(() => {
    refetch();
  }, [query]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard video={item} afterActionHandler={refetch} />
        )}
        ListHeaderComponent={() => (
          <View className="my-4 px-4">
            <Text className="text-2xl text-white font-psemibold">
              Saved Videos
            </Text>
            <Text className="text-2xl font-psemibold text-white">{query}</Text>
            <View className="mt-6 mb-8">
              <SearchInput
                initialQuery={queryString}
                placeholder="Search your saved videos"
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos Found"
            subTitle="No video found for this search query"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Bookmark;
