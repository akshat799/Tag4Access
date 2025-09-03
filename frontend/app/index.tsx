import React, { useState, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import {
  MapPin,
  Plus,
  Filter as FilterIcon,
  User,
  LogOut,
  Calendar,
  BarChart3,
  Flag,
  Settings,
  Users,
} from "lucide-react-native";

const Tag4AccessApp = () => {
  const [activeScreen, setActiveScreen] = useState("map");
  const [selectedFilter, setSelectedFilter] = useState("All Status");

  return (
    <View style={styles.app}>
      {/* App Header */}
      <View style={styles.appHeader}>
        <View style={styles.logoBox}>
          <MapPin size={22} />
        </View>
        <View>
          <Text style={styles.appTitle}>Tag4Access</Text>
          <Text style={styles.appSubtitle}>Community Accessibility</Text>
        </View>
      </View>

      {/* Main */}
      <View style={styles.main}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <ScrollView contentContainerStyle={styles.sidebarScroll}>
            {/* Navigation */}
            <Text style={styles.sectionLabel}>Navigation</Text>
            <NavigationItem
              icon={MapPin}
              title="Map"
              subtitle="Interactive accessibility map"
              isActive={activeScreen === "map"}
              onPress={() => setActiveScreen("map")}
            />
            <NavigationItem
              icon={Plus}
              title="Submit Tag"
              subtitle="Report accessibility issues"
              isActive={activeScreen === "submit"}
              onPress={() => setActiveScreen("submit")}
            />
            <NavigationItem icon={Calendar} title="Events" subtitle="Community events and announcements" />
            <NavigationItem icon={Flag} title="Awareness" subtitle="Accessibility awareness content" />
            <NavigationItem icon={BarChart3} title="Progress Log" subtitle="View mapping progress over time" />
            <NavigationItem icon={Flag} title="Review Tags" subtitle="Confirm submitted tags" />
            <NavigationItem icon={Settings} title="Manage Events" subtitle="Create and manage announcements" />
            <NavigationItem icon={Users} title="Manage Reviewers" subtitle="Manage access levels" />
            <NavigationItem icon={Settings} title="Admin Dashboard" subtitle="Manage users and system" />

            {/* Quick Stats */}
            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Quick Stats</Text>
            <StatItem title="Current City" value="Halifax" />
            <StatItem title="Tags Submitted" value="0" />
            <StatItem title="Confirmed" value="0" />
          </ScrollView>

          {/* User footer */}
          <View style={styles.userFooter}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>B</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>bhawna manchanda</Text>
              <Text style={styles.userRole}>🔹 Admin</Text>
            </View>
            <TouchableOpacity style={styles.logout}>
              <LogOut size={18} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeScreen === "map" ? (
            <MapScreen
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
            />
          ) : (
            <SubmitScreen />
          )}
        </View>
      </View>
    </View>
  );
};

/* ---------------------- Subscreens ---------------------- */

const MapScreen = memo(({ selectedFilter, setSelectedFilter }) => {
  return (
    <ScrollView contentContainerStyle={styles.screenPad}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.h1}>Accessibility Map</Text>
          <Text style={styles.mutedText}>Halifax • 2 locations</Text>
        </View>
        <TouchableOpacity style={styles.primaryGhostBtn}>
          <Plus size={18} />
          <Text style={styles.primaryGhostBtnText}>Add Tag</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={{ marginBottom: 12 }}>
        <View style={styles.rowCenter}>
          <FilterIcon size={16} style={{ marginRight: 6 }} />
          <Text style={styles.mutedText}>Filters:</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          <FilterButton
            title="All Status"
            isActive={selectedFilter === "All Status"}
            onPress={() => setSelectedFilter("All Status")}
          />
          <FilterButton
            title="All Types"
            isActive={selectedFilter === "All Types"}
            onPress={() => setSelectedFilter("All Types")}
          />
          <FilterButton
            title="All"
            isActive={selectedFilter === "All"}
            onPress={() => setSelectedFilter("All")}
          />
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={styles.legendWrap}>
        <LegendDot color="#22c55e" label="Accessible" />
        <LegendDot color="#ef4444" label="Inaccessible" />
        <LegendDot color="#f97316" label="Pending Review" />
        <LegendDot color="#9ca3af" label="Unconfirmed" />
      </View>

      {/* Map mock */}
      <View style={styles.mapBox}>
        <Text style={styles.mapEmoji}>🗺️</Text>
        <Text style={styles.h3}>Interactive Map View</Text>
        <Text style={styles.mutedText}>Halifax Accessibility Mapping</Text>

        {/* Pins (absolute) */}
        <View style={[styles.pin, { top: "33%", left: "50%" }]}>
          <MapPin size={22} />
        </View>
        <View style={[styles.pin, { top: "50%", right: "33%" }]}>
          <MapPin size={20} />
        </View>
        <View style={[styles.pin, { bottom: "33%", left: "33%" }]}>
          <MapPin size={20} />
        </View>
      </View>
    </ScrollView>
  );
});

const SubmitScreen = memo(() => {
  return (
    <ScrollView contentContainerStyle={styles.screenPad}>
      <Text style={styles.h1}>Submit Accessibility Tag</Text>
      <Text style={[styles.mutedText, { marginBottom: 16 }]}>
        Report accessibility information for Halifax
      </Text>

      <Text style={styles.h2}>📍 Location Details</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Location Name *</Text>
        <TextInput
          placeholder="Enter location name..."
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Type of Feature *</Text>
        <TextInput
          placeholder="Entrance / Parking / Restroom / Elevator / Ramp"
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Accessibility Status *</Text>
        <TextInput
          placeholder="Accessible / Partially Accessible / Inaccessible"
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Additional Notes</Text>
        <TextInput
          multiline
          numberOfLines={4}
          placeholder="Describe any additional accessibility details..."
          style={[styles.input, { height: 120, textAlignVertical: "top" }]}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <TouchableOpacity style={styles.primaryBtn}>
        <Text style={styles.primaryBtnText}>Submit Accessibility Tag</Text>
      </TouchableOpacity>
    </ScrollView>
  );
});

/* ---------------------- Small components ---------------------- */

const NavigationItem = ({ icon: Icon, title, subtitle, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.navItem,
      isActive && { backgroundColor: "#e0f2fe", borderColor: "#93c5fd" },
    ]}
    activeOpacity={0.8}
  >
    <Icon size={20} />
    <View style={{ marginLeft: 10, flex: 1 }}>
      <Text style={[styles.navTitle, isActive && { color: "#1d4ed8" }]}>{title}</Text>
      {!!subtitle && <Text style={styles.navSubtitle}>{subtitle}</Text>}
    </View>
  </TouchableOpacity>
);

const FilterButton = ({ title, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.chip,
      isActive ? { backgroundColor: "#3b82f6" } : { backgroundColor: "#f3f4f6" },
    ]}
  >
    <Text style={[styles.chipText, isActive ? { color: "#fff" } : { color: "#4b5563" }]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const StatItem = ({ title, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{title}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const LegendDot = ({ color, label }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

/* ---------------------- Styles ---------------------- */

const SIDEBAR_WIDTH = 280;

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: "#ffffff" },
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    gap: 12,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  appTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  appSubtitle: { fontSize: 12, color: "#6b7280" },

  main: { flex: 1, flexDirection: "row" },

  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: "#f9fafb",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  sidebarScroll: { padding: 16 },
  sectionLabel: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 6,
  },
  navTitle: { fontSize: 14, fontWeight: "600", color: "#374151" },
  navSubtitle: { fontSize: 12, color: "#6b7280", marginTop: 2 },

  userFooter: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700" },
  userName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  userRole: { fontSize: 12, color: "#6b7280" },
  logout: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoutText: { marginLeft: 6, color: "#374151" },

  content: { flex: 1, backgroundColor: "#ffffff" },

  screenPad: { padding: 16 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  h1: { fontSize: 20, fontWeight: "700", color: "#111827", marginBottom: 2 },
  h2: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 },
  h3: { fontSize: 16, fontWeight: "600", color: "#374151", marginTop: 4 },
  mutedText: { fontSize: 12, color: "#6b7280" },

  primaryGhostBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  primaryGhostBtnText: { color: "#1d4ed8", fontWeight: "600" },

  row: { flexDirection: "row", gap: 8, marginTop: 8 },
  rowCenter: { flexDirection: "row", alignItems: "center", marginBottom: 6 },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: { fontSize: 12, fontWeight: "600" },

  legendWrap: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 12 },
  legendItem: { flexDirection: "row", alignItems: "center" },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12, color: "#4b5563" },

  mapBox: {
    minHeight: 320,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
  },
  mapEmoji: { fontSize: 40, marginBottom: 4 },
  pin: { position: "absolute" },

  formGroup: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },

  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  statLabel: { fontSize: 12, color: "#6b7280" },
  statValue: { fontSize: 12, fontWeight: "700", color: "#1d4ed8" },

  primaryBtn: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
});

export default Tag4AccessApp;
