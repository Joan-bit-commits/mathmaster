import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Avatar from "../../../src/components/ui/Avatar";
import Badge from "../../../src/components/ui/Badge";
import Button from "../../../src/components/ui/Button";
import MaterialIcon from "../../../src/components/ui/MaterialIcon";
import Screen from "../../../src/components/ui/Screen";
import { useTabBarSpacing } from '../../../src/hooks/useTabBarSpacing';

import { useAuthStore } from "../../../src/stores/authStore";

const SECTIONS = [
  {
    title: "Account",
    items: [
      {
        icon: "person",
        label: "Edit profile",
        route: "/(shared)/edit-profile",
      },
      {
        icon: "lock",
        label: "Change password",
        route: "/(shared)/change-password",
      },
      {
        icon: "mail",
        label: "Email & notifications",
        route: "/(shared)/settings",
      },
    ],
  },
  {
    title: "Learning",
    items: [
      {
        icon: "history",
        label: "AI tutor history",
        route: "/(student)/ai-tutor/history",
      },
      {
        icon: "leaderboard",
        label: "Performance detail",
        route: "/(student)/performance/all",
      },
      { icon: "description", label: "My Documents", route: "/(student)/documents" },
      { icon: "photo_camera", label: "Scan history", route: "/(student)/scan" },
      { icon: "school", label: "Curriculum browser", route: "/(student)/curriculum" },
      { icon: "star", label: "Achievements", route: null },
    ],
  },
  {
    title: "App",
    items: [
      { icon: "settings", label: "Settings", route: "/(shared)/settings" },
      {
        icon: "notifications",
        label: "Notifications",
        route: "/(shared)/notifications",
      },
      {
        icon: "download",
        label: "Offline content",
        route: "/(shared)/offline",
      },
    ],
  },
  {
    title: "Support & About",
    items: [
      { icon: "help", label: "Help centre", route: null },
      { icon: "privacy_tip", label: "Privacy policy", route: null },
      { icon: "info", label: "About MathMaster", route: null },
    ],
  },
];

export default function StudentProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const tabBarSpacing = useTabBarSpacing();

  const handleLogout = async () => {
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      accessibilityLabel="Student profile"
    >
      <Screen>
        <ScrollView
  contentContainerClassName="px-[24px]"
  contentContainerStyle={{ paddingBottom: tabBarSpacing + 32 }}
  showsVerticalScrollIndicator={false}
>
          <View className="items-center py-6">
            <Avatar name={user?.username || "A"} size="xl" />
            <Text
              accessibilityRole="header"
              className="text-[24px] leading-8 font-semibold text-on-surface mt-3"
            >
              {user?.first_name || user?.username || "Student"}
            </Text>
            <View className="flex-row gap-2 mt-2">
              <Badge tone="info" label={user?.role || "student"} />
              <Badge tone="success" label={`Level ${user?.level || "S3"}`} />
            </View>
          </View>

          {SECTIONS.map((section) => (
            <View key={section.title} className="mb-6">
              <Text className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2 px-1">
                {section.title}
              </Text>
              <View className="bg-surface-container-lowest rounded-2xl shadow-level-1 overflow-hidden">
                {section.items.map((item) => (
                  <Pressable
                    key={item.label}
                    onPress={() => item.route && router.push(item.route)}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    className="flex-row items-center gap-3 px-4 py-3.5 active:bg-surface-container-low"
                  >
                    <MaterialIcon
                      name={item.icon}
                      size={22}
                      color="on-surface-variant"
                    />
                    <Text className="flex-1 font-body-md text-body-md text-on-surface">
                      {item.label}
                    </Text>
                    <MaterialIcon
                      name="chevron_right"
                      size={20}
                      color="outline"
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          {/* Dev-only role switch */}
          {__DEV__ ? (
            <Button
              variant="secondary"
              label="Switch role (debug)"
              icon="swap-horiz"
              onPress={() => {
                logout();
                router.replace("/(auth)/login");
              }}
              fullWidth
              accessibilityLabel="Switch role debug"
              className="mb-3"
            />
          ) : null}

          <Button
            variant="destructive"
            label="Sign out"
            icon="logout"
            onPress={handleLogout}
            fullWidth
            accessibilityLabel="Sign out"
          />
        </ScrollView>
      </Screen>
    </SafeAreaView>
  );
}
