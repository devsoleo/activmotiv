# activmotiv

## Production
### Build
eas build --platform android --profile preview

## Development
Icons : https://pictogrammers.com/library/mdi/
SAM : https://en.wikipedia.org/wiki/Self-Assessment_Manikin
### Run
npx expo run:android

### Send .env to expo
eas env:push --environment=preview --path ./.env