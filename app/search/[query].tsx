import { useLocalSearchParams } from "expo-router";
import EmptyState from "@/components/EmptyState";
import SearchInput from "@/components/SearchInput";
import VideoCard from "@/components/VideoCard";
import { searchPosts } from "@/lib/appwrite";
import React, { useEffect } from "react";
import { FlatList, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import useAppwrite from "@/lib/useAppwrite";

const Search = () => {
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
  } = useAppwrite(() => searchPosts(queryString));

  useEffect(() => {
    refetch();
  }, [query]);

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <VideoCard video={item} />}
        ListHeaderComponent={() => (
          <View className="my-6 px-4">
            <Text className="font-pmedium text-sm text-gray-100">
              Search Result
            </Text>
            <Text className="text-2xl font-psemibold text-white">{query}</Text>
            <View className="mt-6 mb-8">
              <SearchInput
                initialQuery={queryString}
                placeholder="Search for a video topic"
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
      />
    </SafeAreaView>
  );
};

export default Search;
