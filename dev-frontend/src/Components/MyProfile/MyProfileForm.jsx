import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfileToServer, getProfileFromServer } from "../../services/DevCrud";

/**
 * DevConnect — My Profile Form
 * Everything below the profile header, as ONE form: the avatar,
 * basic info, location & links, and security panels, plus the
 * sticky save bar and the confirmation modal.
 *
 * Save flow (the only path to the server):
 *   1. "save changes" (type="submit") -> handleSubmit validates the form.
 *      Any error stops here and the modal never opens.
 *   2. Valid -> a trimmed snapshot is stored and the confirm modal opens.
 *   3. "Confirm" -> handleConfirm validates the snapshot once more, then
 *      calls updateProfileToServer(pendingChanges).
 *
 * updateProfileToServer receives one object:
 *   {
 *     fields:       { username, bio, location, website, socialLinks },
 *     avatarFile:   File | null,   // a new image, if one was picked
 *     removeAvatar: boolean        // true if the avatar was removed
 *   }
 * It should either throw on failure, or resolve to { success: false,
 * message } — both are handled. Anything else counts as success.
 *
 * Usage:
 *   <MyProfileForm
 *     profile={profile}                 // stable object, not an inline literal
 *     serverError={serverError}         // optional
 *     onDirtyChange={setIsDirty}        // drives the unsaved dot in the header
 *     onSaved={(result) => setProfile(result.data)}  // refresh profile after save
 *     onChangePassword={() => navigate("/change-password")}
 *   />
 */

const BIO_MAX = 160;
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

const EMPTY_PROFILE = {
    username: "",
    email: "",
    bio: "",
    avatar: "",
    location: "",
    website: "",
    socialLinks: { github: "", twitter: "", linkedin: "" },
};

const SOCIAL_FIELDS = [
    { key: "github", label: "github", placeholder: "https://github.com/username" },
    { key: "twitter", label: "twitter / x", placeholder: "https://x.com/username" },
    { key: "linkedin", label: "linkedin", placeholder: "https://linkedin.com/in/username" },
];

function toFormState(profile) {
    return {
        username: profile.username ?? "",
        bio: profile.bio ?? "",
        location: profile.location ?? "",
        website: profile.website ?? "",
        socialLinks: {
            github: profile.socialLinks?.github ?? "",
            twitter: profile.socialLinks?.twitter ?? "",
            linkedin: profile.socialLinks?.linkedin ?? "",
        },
    };
}

function isValidUrl(value) {
    if (!value) return true; // empty is fine, these fields are optional
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function validate(form) {
    const errors = {};
    if (!form.username.trim()) errors.username = "username is required";
    if (form.bio.length > BIO_MAX) errors.bio = `bio must be ${BIO_MAX} characters or fewer`;
    if (!isValidUrl(form.website.trim())) errors.website = "must start with http:// or https://";
    SOCIAL_FIELDS.forEach(({ key }) => {
        if (!isValidUrl(form.socialLinks[key].trim())) {
            errors[key] = "must start with http:// or https://";
        }
    });
    return errors;
}

function inputClass(hasError, mono = false) {
    return `w-full bg-[#2a2c37] border ${hasError ? "border-[#e18a8a]" : "border-[#383a46]"
        } rounded-md px-3.5 py-[11px] text-[#e8e9ee] text-[0.9rem] outline-none focus:border-[#8fd19e] placeholder:text-[#5a5c6b] transition-colors ${mono ? "font-mono text-[0.84rem]" : ""
        }`;
}

function Panel({ title, children }) {
    return (
        <div className="bg-[#23252e] border border-[#383a46] rounded-[10px] p-[18px] sm:p-[22px_24px] mb-4">
            <h4 className="font-mono text-[0.78rem] text-[#8fd19e] font-medium mb-[18px]">
        // {title}
            </h4>
            {children}
        </div>
    );
}

function Field({ id, label, optional, counter, error, hint, children }) {
    return (
        <div className="mb-[18px] last:mb-0">
            <label
                htmlFor={id}
                className="flex justify-between items-center font-mono text-[0.76rem] text-[#7eb6e0] mb-2"
            >
                <span>{label}</span>
                {optional && <span className="text-[#5a5c6b]">optional</span>}
                {counter}
            </label>
            {children}
            {error ? (
                <div className="text-[0.74rem] text-[#e18a8a] mt-1.5">{error}</div>
            ) : hint ? (
                <div className="text-[0.74rem] text-[#5a5c6b] mt-1.5">{hint}</div>
            ) : null}
        </div>
    );
}

// the sticky bar — internal, only used inside MyProfileForm.
// The save button is a plain submit button: the form's onSubmit is the
// only thing that runs when it is clicked.
function SaveBar({ isDirty, isSaving, error, onCancel }) {
    const saveDisabled = !isDirty || isSaving;

    return (
        <div className="fixed inset-x-0 bottom-0 z-10 bg-[#23252ef2] backdrop-blur border-t border-[#383a46] px-5 sm:px-6 pt-3.5 pb-[calc(14px_+_env(safe-area-inset-bottom,0px))]">
            <div className="max-w-[760px] mx-auto flex items-center justify-between gap-3.5 flex-wrap">
                <div className="flex items-center gap-2 font-mono text-[0.78rem] min-w-0">
                    {error ? (
                        <span className="text-[#e18a8a]">{error}</span>
                    ) : isDirty ? (
                        <>
                            <span className="w-[7px] h-[7px] rounded-full bg-[#e8a87c] shrink-0" />
                            <span className="text-[#8b8d9b]">unsaved changes</span>
                        </>
                    ) : (
                        <span className="text-[#5a5c6b]">no changes</span>
                    )}
                </div>

                <div className="flex gap-2.5 ml-auto">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSaving}
                        className="px-[18px] py-[9px] rounded-md border border-[#383a46] text-[#8b8d9b] font-mono text-[0.82rem] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saveDisabled}
                        className="px-5 py-[9px] rounded-md border border-[#8fd19e] bg-[#8fd19e] text-[#182019] font-mono text-[0.82rem] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? "saving..." : "save changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MyProfileForm({
    profile,
    serverError = "",
    onDirtyChange,
    onSaved,
    onChangePassword,
}) {
    const navigate = useNavigate();
    const initial = useMemo(() => toFormState(profile), [profile]);
    const [form, setForm] = useState(initial);
    const [errors, setErrors] = useState({});
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingChanges, setPendingChanges] = useState(null);
    const [confirmError, setConfirmError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    // -------------------------
    // RESET — on cancel, and whenever a fresh profile arrives (e.g. after saving)
    // -------------------------
    const resetAll = () => {
        setForm(initial);
        setErrors({});
        setAvatarFile(null);
        setAvatarPreview("");
        setRemoveAvatar(false);
        setAvatarError("");
        setShowConfirm(false);
        setPendingChanges(null);
        setConfirmError("");
    };

    useEffect(() => {
        resetAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initial]);

    // free the temporary preview URL when it changes or on unmount
    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);
    const avatarUrl = profile.avatar
        ? `http://localhost:3000${profile.avatar}`
        : "";

    // -------------------------
    // DIRTY TRACKING
    // -------------------------
    const isDirty = useMemo(
        () =>
            JSON.stringify(form) !== JSON.stringify(initial) ||
            avatarFile !== null ||
            removeAvatar,
        [form, initial, avatarFile, removeAvatar]
    );

    useEffect(() => {
        onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    // -------------------------
    // FIELD HANDLERS
    // -------------------------
    const clearError = (key) =>
        setErrors((prev) => {
            if (!prev[key]) return prev;
            const { [key]: _removed, ...rest } = prev;
            return rest;
        });

    const updateField = (name) => (e) => {
        setForm((prev) => ({ ...prev, [name]: e.target.value }));
        clearError(name);
    };

    const updateSocial = (key) => (e) => {
        setForm((prev) => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [key]: e.target.value },
        }));
        clearError(key);
    };

    // -------------------------
    // AVATAR HANDLERS
    // -------------------------
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // lets the user re-pick the same file later
        if (!file) return;

        if (!AVATAR_TYPES.includes(file.type)) {
            setAvatarError("use a JPG, PNG or WebP image");
            return;
        }
        if (file.size > AVATAR_MAX_BYTES) {
            setAvatarError("image must be under 2 MB");
            return;
        }

        setAvatarError("");
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setRemoveAvatar(false);
    };

    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview("");
        setAvatarError("");
        setRemoveAvatar(true);
    };

    const shownAvatar = removeAvatar
        ? ""
        : avatarPreview || avatarUrl;
    const avatarLetter = (form.username || profile.username || "?").charAt(0).toUpperCase();
    const hasAvatarToRemove = !removeAvatar && (avatarPreview || profile.avatar);

    // -------------------------
    // STEP 1 — "save changes": validate, and only then open the confirm modal
    // -------------------------
    const handleSubmit = (e) => {
        e.preventDefault();

        const nextErrors = validate(form);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setConfirmError("");
        setPendingChanges({
            fields: {
                username: form.username.trim(),
                bio: form.bio.trim(),
                location: form.location.trim(),
                website: form.website.trim(),
                socialLinks: {
                    github: form.socialLinks.github.trim(),
                    twitter: form.socialLinks.twitter.trim(),
                    linkedin: form.socialLinks.linkedin.trim(),
                },
            },
            avatarFile,
            removeAvatar,
        });
        setShowConfirm(true);
    };

    // -------------------------
    // STEP 2 — "Confirm": validate again, then call the server function
    // -------------------------
    const handleConfirm = async () => {
        if (!pendingChanges || isSaving) return;

        // last line of defence: nothing unvalidated ever reaches the server
        const nextErrors = validate(pendingChanges.fields);
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            setShowConfirm(false);
            setPendingChanges(null);
            return;
        }

        setConfirmError("");
        setIsSaving(true);
        try {
            const result = await updateProfileToServer(pendingChanges);

            // the function may report failure by returning { success: false }
            if (result?.success === false) {
                setConfirmError(result.message || "Could not save profile changes. Please try again.");
                return;
            }

            setShowConfirm(false);
            setPendingChanges(null);
            onSaved?.(result); // parent refreshes `profile`, which resets the form
        } catch (error) {
            setConfirmError(error?.message || "Could not save profile changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelConfirm = () => {
        if (isSaving) return;
        setShowConfirm(false);
        setPendingChanges(null);
        setConfirmError("");
    };

    // cancel in the sticky bar: discard edits and leave the page
    const handleCancel = () => {
        resetAll();
        navigate("/devHomePage");
    };

    const bioNearLimit = form.bio.length >= BIO_MAX - 10;

    return (
        <div className="min-h-screen bg-[#1e1f26] text-[#e8e9ee]">
            {/* noValidate: our own validation shows the messages, not the browser's popups */}
            <form onSubmit={handleSubmit} noValidate>
                <main className="max-w-[760px] mx-auto px-5 sm:px-6 pt-9 pb-32">
                    <div className="font-mono text-[0.82rem] text-[#5a5c6b] mb-1.5">
            // <span className="text-[#8fd19e]">make it yours</span>
                    </div>
                    <h1 className="text-[1.7rem] font-semibold mb-7 tracking-[-0.01em]">
                        Edit profile
                    </h1>

                    {/* AVATAR */}
                    <Panel title="avatar">
                        <div className="flex items-center gap-5 flex-wrap">
                            {shownAvatar ? (
                                <img
                                    src={shownAvatar}
                                    alt="your avatar"
                                    onError={(e) => {
                                        console.error("Avatar failed to load:", e.currentTarget.src);
                                    }}
                                    className="w-[84px] h-[84px] rounded-full object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-br from-[#8fd19e] to-[#7eb6e0] flex items-center justify-center font-mono text-[1.8rem] font-semibold text-[#182019] shrink-0">
                                    {avatarLetter}
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="font-mono text-[0.76rem] px-3.5 py-[7px] rounded-md border border-[#383a46] bg-[#2a2c37] text-[#8b8d9b] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors"
                                    >
                                        upload new
                                    </button>
                                    {hasAvatarToRemove && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveAvatar}
                                            className="font-mono text-[0.76rem] px-3.5 py-[7px] rounded-md border border-[#383a46] bg-[#2a2c37] text-[#8b8d9b] hover:text-[#e18a8a] hover:border-[#e18a8a] transition-colors"
                                        >
                                            remove
                                        </button>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept={AVATAR_TYPES.join(",")}
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </div>
                                <div
                                    className={`text-[0.74rem] ${avatarError ? "text-[#e18a8a]" : "text-[#5a5c6b]"
                                        }`}
                                >
                                    {avatarError || "JPG, PNG or WebP · max 2 MB · square works best"}
                                </div>
                            </div>
                        </div>
                    </Panel>

                    {/* BASIC INFO */}
                    <Panel title="basic info">
                        <Field
                            id="profile-username"
                            label="username"
                            error={errors.username}
                            hint="shown on your posts and profile · must be unique"
                        >
                            <input
                                id="profile-username"
                                type="text"
                                value={form.username}
                                onChange={updateField("username")}
                                placeholder="your_username"
                                className={inputClass(!!errors.username, true)}
                            />
                        </Field>

                        <Field
                            id="profile-email"
                            label="email"
                            hint="private — only used for login, never shown publicly"
                        >
                            <input
                                id="profile-email"
                                type="email"
                                value={profile.email}
                                readOnly
                                className={`${inputClass(false, true)} opacity-60 cursor-not-allowed`}
                            />
                        </Field>

                        <Field
                            id="profile-bio"
                            label="bio"
                            error={errors.bio}
                            counter={
                                <span className={bioNearLimit ? "text-[#e8a87c]" : "text-[#5a5c6b]"}>
                                    {form.bio.length} / {BIO_MAX}
                                </span>
                            }
                        >
                            <textarea
                                id="profile-bio"
                                value={form.bio}
                                onChange={updateField("bio")}
                                maxLength={BIO_MAX}
                                placeholder="Tell people what you build..."
                                className={`${inputClass(!!errors.bio)} resize-y min-h-[92px] leading-[1.6]`}
                            />
                        </Field>
                    </Panel>

                    {/* LOCATION & LINKS */}
                    <Panel title="location & links">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-[18px]">
                            <Field id="profile-location" label="location" optional>
                                <input
                                    id="profile-location"
                                    type="text"
                                    value={form.location}
                                    onChange={updateField("location")}
                                    placeholder="City, Country"
                                    className={inputClass(false)}
                                />
                            </Field>

                            <Field id="profile-website" label="website" optional error={errors.website}>
                                <input
                                    id="profile-website"
                                    type="url"
                                    value={form.website}
                                    onChange={updateField("website")}
                                    placeholder="https://"
                                    className={inputClass(!!errors.website, true)}
                                />
                            </Field>
                        </div>

                        {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
                            <Field key={key} id={`profile-${key}`} label={label} optional error={errors[key]}>
                                <input
                                    id={`profile-${key}`}
                                    type="url"
                                    value={form.socialLinks[key]}
                                    onChange={updateSocial(key)}
                                    placeholder={placeholder}
                                    className={inputClass(!!errors[key], true)}
                                />
                            </Field>
                        ))}
                    </Panel>

                    {/* SECURITY */}
                    <Panel title="security">
                        <div className="flex justify-between items-center gap-3.5 flex-wrap">
                            <p className="m-0 text-[0.86rem] text-[#8b8d9b] max-w-[480px]">
                                Change your password from a separate screen so it can ask for your
                                current one.
                            </p>
                            <button
                                type="button"
                                onClick={onChangePassword}
                                className="font-mono text-[0.76rem] px-3.5 py-[7px] rounded-md border border-[#383a46] bg-[#2a2c37] text-[#8b8d9b] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors"
                            >
                                change password
                            </button>
                        </div>
                    </Panel>
                </main>

                {/* STICKY SAVE BAR */}
                <SaveBar
                    isDirty={isDirty}
                    isSaving={isSaving}
                    error={serverError}
                    onCancel={handleCancel}
                />
            </form>

            {/* CONFIRMATION MODAL */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirm-profile-title"
                        className="w-full max-w-md rounded-xl border border-[#383a46] bg-[#23252e] p-6 shadow-xl"
                    >
                        <h2
                            id="confirm-profile-title"
                            className="mb-3 text-lg font-semibold text-[#e8e9ee]"
                        >
                            Confirm profile changes
                        </h2>

                        <p className="mb-6 text-sm leading-6 text-[#8b8d9b]">
                            Are you sure you want to save these profile changes?
                        </p>

                        {(confirmError || serverError) && (
                            <p className="mb-4 text-sm text-[#e18a8a]">
                                {confirmError || serverError}
                            </p>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancelConfirm}
                                disabled={isSaving}
                                className="rounded-md border border-[#383a46] px-4 py-2 text-sm text-[#8b8d9b] hover:border-[#8b8d9b] hover:text-[#e8e9ee] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isSaving}
                                className="rounded-md border border-[#8fd19e] bg-[#8fd19e] px-4 py-2 text-sm font-semibold text-[#182019] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSaving ? "Saving..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}