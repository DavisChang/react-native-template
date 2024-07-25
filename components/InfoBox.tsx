import { View, Text } from "react-native";
import React from "react";

type InfoBoxProps = {
  title: string | number;
  subTitle?: string;
  containerStyles: string;
  titleStyles: string;
};
const InfoBox = ({
  title,
  subTitle,
  containerStyles,
  titleStyles,
}: InfoBoxProps) => {
  return (
    <View className={containerStyles}>
      <Text className={`text-white text-center font-psemibold ${titleStyles}`}>
        {title}
      </Text>
      <Text className="text-sm text-gray-100 text-center font-pregular">
        {subTitle}
      </Text>
    </View>
  );
};

export default InfoBox;
