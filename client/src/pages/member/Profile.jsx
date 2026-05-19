import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { memberService } from "../../services";
import { PageWrapper, SectionHeader, SkeletonCard } from "../../components/ui";
import ProfileForm from "../../components/profile/ProfileForm";
import { useAuthStore } from "../../store";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await memberService.getProfile();
      const data = response?.data?.data || response?.data;
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (formData) => {
    try {
      setUpdating(true);
      const response = await memberService.updateProfile(formData);
      const updatedData = response?.data?.data || response?.data;
      setProfileData(updatedData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const isProfileComplete =
    profileData?.profile?.age &&
    profileData?.profile?.gender &&
    profileData?.profile?.height &&
    profileData?.profile?.weight &&
    profileData?.profile?.fitnessGoal &&
    profileData?.profile?.activityLevel;

  const getProfileCompleteness = () => {
    if (!profileData?.profile) return 0;
    const fields = [
      "age",
      "gender",
      "height",
      "weight",
      "fitnessGoal",
      "activityLevel",
      "medicalConditions",
      "allergies",
    ];
    const filledFields = fields.filter(
      (field) =>
        profileData.profile[field] !== undefined &&
        profileData.profile[field] !== null &&
        (Array.isArray(profileData.profile[field])
          ? profileData.profile[field].length > 0
          : profileData.profile[field] !== ""),
    ).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completeness = getProfileCompleteness();

  if (loading) {
    return (
      <PageWrapper>
        <SectionHeader
          title="My Profile"
          sub="View and update your fitness profile"
        />
        <div className="space-y-4">
          <SkeletonCard height="h-32" />
          <SkeletonCard height="h-96" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <SectionHeader
        title="My Profile"
        sub="Manage your fitness profile information"
        action={
          !isEditing && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded text-sm font-heading tracking-wider uppercase"
              style={{
                background: "var(--accent)",
                color: "white",
              }}
            >
              Edit Profile
            </motion.button>
          )
        }
      />

      {/* Profile Overview Card */}
      {!isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded"
          style={{
            background: "var(--bg-muted)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="font-heading text-xl tracking-widest uppercase text-white mb-1">
                {profileData?.name || "User"}
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                {profileData?.email}
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-xs font-heading tracking-widest uppercase mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Profile Complete
              </p>
              <p
                className="font-display text-3xl"
                style={{
                  color:
                    completeness === 100 ? "var(--success)" : "var(--accent)",
                }}
              >
                {completeness}%
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div
              className="w-full h-2 rounded overflow-hidden"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completeness}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded"
                style={{
                  background:
                    completeness === 100 ? "var(--success)" : "var(--accent)",
                }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Basic Info */}
            <div
              className="p-3 rounded"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <p
                className="text-xs mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Age
              </p>
              <p className="font-display text-lg text-white">
                {profileData?.profile?.age || "—"} yrs
              </p>
            </div>

            <div
              className="p-3 rounded"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <p
                className="text-xs mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Gender
              </p>
              <p className="font-display text-lg text-white capitalize">
                {profileData?.profile?.gender || "—"}
              </p>
            </div>

            <div
              className="p-3 rounded"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <p
                className="text-xs mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Height
              </p>
              <p className="font-display text-lg text-white">
                {profileData?.profile?.height
                  ? `${profileData.profile.height} cm`
                  : "—"}
              </p>
            </div>

            <div
              className="p-3 rounded"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <p
                className="text-xs mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Weight
              </p>
              <p className="font-display text-lg text-white">
                {profileData?.profile?.weight
                  ? `${profileData.profile.weight} kg`
                  : "—"}
              </p>
            </div>
          </div>

          {/* BMI */}
          {profileData?.bmi && (
            <div
              className="mt-4 p-3 rounded"
              style={{ background: "rgba(255,60,47,0.1)" }}
            >
              <p
                className="text-xs mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                BMI Index
              </p>
              <p
                className="font-display text-lg"
                style={{ color: "var(--accent)" }}
              >
                {profileData.bmi}
              </p>
            </div>
          )}

          {/* Fitness Info */}
          <div
            className="mt-6 pt-6 border-t"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Fitness Goal
                </p>
                <p className="font-heading text-sm uppercase tracking-widest text-white">
                  {profileData?.profile?.fitnessGoal
                    ? profileData.profile.fitnessGoal.replace(/_/g, " ")
                    : "Not set"}
                </p>
              </div>
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Activity Level
                </p>
                <p className="font-heading text-sm uppercase tracking-widest text-white">
                  {profileData?.profile?.activityLevel
                    ? profileData.profile.activityLevel.replace(/_/g, " ")
                    : "Not set"}
                </p>
              </div>
            </div>
          </div>

          {/* Health Info */}
          {(profileData?.profile?.medicalConditions?.length > 0 ||
            profileData?.profile?.allergies?.length > 0) && (
            <div
              className="mt-6 pt-6 border-t"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              {profileData?.profile?.medicalConditions?.length > 0 && (
                <div className="mb-4">
                  <p
                    className="text-xs mb-2 font-heading tracking-widest uppercase"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Medical Conditions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.profile.medicalConditions.map(
                      (condition, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded text-sm"
                          style={{
                            background: "rgba(255,60,47,0.12)",
                            border: "1px solid rgba(255,60,47,0.25)",
                            color: "var(--accent)",
                          }}
                        >
                          {condition}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}

              {profileData?.profile?.allergies?.length > 0 && (
                <div>
                  <p
                    className="text-xs mb-2 font-heading tracking-widest uppercase"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Allergies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.profile.allergies.map((allergy, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded text-sm"
                        style={{
                          background: "rgba(255,60,47,0.12)",
                          border: "1px solid rgba(255,60,47,0.25)",
                          color: "var(--accent)",
                        }}
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completion Warning */}
          {!isProfileComplete && (
            <div
              className="mt-6 pt-6 border-t p-4 rounded"
              style={{
                borderColor: "rgba(255,255,255,0.06)",
                background: "rgba(255,184,0,0.08)",
              }}
            >
              <div className="flex gap-3">
                <AlertCircle
                  size={20}
                  style={{ color: "var(--warn)" }}
                  className="flex-shrink-0 mt-0.5"
                />
                <div>
                  <p
                    className="font-heading text-sm uppercase tracking-wider mb-1"
                    style={{ color: "var(--warn)" }}
                  >
                    Complete Your Profile
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Fill in all required fields to unlock personalized AI
                    recommendations for your fitness journey.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <ProfileForm
            initialData={profileData?.profile || {}}
            onSubmit={handleProfileUpdate}
            loading={updating}
          />
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            onClick={() => setIsEditing(false)}
            className="w-full mt-4 px-6 py-3 rounded text-sm font-heading tracking-wider uppercase transition-colors"
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
            }}
          >
            Cancel
          </motion.button>
        </motion.div>
      )}

      {/* Success Message */}
      {isProfileComplete && !isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-4 rounded flex items-center gap-3"
          style={{
            background: "rgba(57,255,20,0.08)",
            border: "1px solid rgba(57,255,20,0.25)",
          }}
        >
          <CheckCircle size={20} style={{ color: "var(--success)" }} />
          <div>
            <p
              className="font-heading text-sm uppercase tracking-wider"
              style={{ color: "var(--success)" }}
            >
              Profile Complete
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Your trainer can now generate personalized workout and diet plans
              based on your information.
            </p>
          </div>
        </motion.div>
      )}
    </PageWrapper>
  );
}
