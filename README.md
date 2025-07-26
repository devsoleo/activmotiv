# activmotiv

## Production
### Build local
Documentation : https://docs.expo.dev/guides/local-app-production/

Place keystore : ./android/app/activmotiv-release.keystore

Add to ./android/gradle.properties :
```
MYAPP_UPLOAD_STORE_PASSWORD=s3cret
MYAPP_UPLOAD_KEY_PASSWORD=s3cret
```

APK : .\gradlew assembleRelease
AAB : .\gradlew app:bundleRelease

### Build EAS (deprecated)
eas build --platform android --profile preview

## Development
Icons : https://pictogrammers.com/library/mdi/
SAM : https://en.wikipedia.org/wiki/Self-Assessment_Manikin
### Run
npx expo run:android

### Send .env to expo
eas env:push --environment=preview --path ./.env