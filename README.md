# activmotiv
## Développement
### Lancement
Documentation : https://docs.expo.dev/guides/local-app-production/

Copier le fichier de keystore dans ./android/app/activmotiv-release.keystore

Copier le fichier google-services dans ./android/app/google-services.json

Modifier les variables d'environnements présentes dans devrun.sh

Puis lancer ./devrun.sh

### Build local
APK : .\gradlew assembleRelease
AAB : .\gradlew app:bundleRelease