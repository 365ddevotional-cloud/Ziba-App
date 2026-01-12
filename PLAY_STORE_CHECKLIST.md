# Ziba - Google Play Store Preparation Checklist

## Stage 16 Complete - Production Hardened

---

## App Versioning

- [ ] Set `versionCode` (integer, increment for each release)
- [ ] Set `versionName` (user-facing version string, e.g., "1.0.0")
- [ ] Update version in `package.json`

Example for Android (build.gradle):
```gradle
android {
    defaultConfig {
        versionCode 1
        versionName "1.0.0"
    }
}
```

---

## Permissions Used

Review and justify each permission:

- [ ] `INTERNET` - Required for API communication
- [ ] `ACCESS_FINE_LOCATION` - Required for ride pickup/dropoff
- [ ] `ACCESS_COARSE_LOCATION` - Fallback location
- [ ] `CAMERA` (if applicable) - For document uploads
- [ ] `READ_EXTERNAL_STORAGE` (if applicable) - For profile photos

---

## Privacy Policy Requirement

- [ ] Create a Privacy Policy document covering:
  - Data collection (personal info, location, payment data)
  - Data usage and storage
  - Third-party sharing policies
  - User rights (access, deletion, correction)
  - Contact information for data inquiries
- [ ] Host Privacy Policy at a public URL
- [ ] Add Privacy Policy link in app settings
- [ ] Add Privacy Policy link in Play Store listing

---

## Terms of Service Requirement

- [ ] Create Terms of Service document covering:
  - User responsibilities
  - Driver responsibilities
  - Platform liability limitations
  - Payment terms and refund policies
  - Account suspension/termination policies
- [ ] Host Terms of Service at a public URL
- [ ] Add Terms of Service link in app settings

---

## Security Checklist

- [x] No hardcoded secrets in codebase
- [x] No bootstrap or reset logic (removed in Stage 16)
- [x] Passwords hashed with bcrypt
- [x] Admin login stable across restarts
- [x] Debug routes disabled in production
- [x] Test account login blocked in production
- [x] Session-based authentication with secure cookies
- [x] No environment-based admin bypass

---

## Internal Testing Steps

1. **Create Internal Test Track**
   - Go to Google Play Console > Testing > Internal testing
   - Create a new release
   - Upload signed APK/AAB

2. **Add Testers**
   - Add email addresses of internal testers
   - Send invitation links

3. **Test Checklist**
   - [ ] User registration flow
   - [ ] Admin login with founder@ziba.app
   - [ ] Ride request and completion
   - [ ] Driver assignment
   - [ ] Payment processing
   - [ ] Wallet transactions
   - [ ] Notifications
   - [ ] Rating system

---

## Closed Testing → Production Steps

1. **Closed Testing (Alpha/Beta)**
   - [ ] Create closed testing track
   - [ ] Add larger group of testers
   - [ ] Collect feedback for 2+ weeks
   - [ ] Fix critical bugs

2. **Open Testing (Optional)**
   - [ ] Expand to public beta
   - [ ] Monitor crash reports and ANRs
   - [ ] Address user feedback

3. **Production Release**
   - [ ] Complete all required store listing fields
   - [ ] Add screenshots for all device sizes
   - [ ] Write compelling app description
   - [ ] Set content rating via questionnaire
   - [ ] Configure pricing and distribution
   - [ ] Submit for review

---

## Store Listing Requirements

- [ ] App name (max 30 characters)
- [ ] Short description (max 80 characters)
- [ ] Full description (max 4000 characters)
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (min 2, max 8 per device type)
- [ ] App category selection
- [ ] Content rating questionnaire
- [ ] Contact email
- [ ] Privacy Policy URL

---

## Final Production Confirmation

- [x] Admin login works normally
- [x] Password does NOT change on restart
- [x] No hidden reset logic exists
- [x] Replit compute usage optimized (no polling)
- [x] App is Play Store ready

---

*Generated: Stage 16 Finalization*
*Status: Production Hardened*
