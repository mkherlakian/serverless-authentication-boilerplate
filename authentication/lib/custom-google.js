

const { Provider, Profile } = require('serverless-authentication')

const signinHandler = (config, options) => {
  const customGoogle = new Provider(config)
  const signinOptions = options || {}
  signinOptions.signin_uri = 'https://accounts.google.com/o/oauth2/v2/auth'
  signinOptions.scope = 'profile email'
  signinOptions.response_type = 'code'
  return customGoogle.signin(signinOptions)
}

const callbackHandler = async (event, config) => {
  const customGoogle = new Provider(config)
  const profileMap = (response) =>
    new Profile({
      id: response.names[0].metadata.source.id,
      //name: response.displayName,
      name: response.names ? response.names[0].displayName : null,
      email: response.emailAddresses ? response.emailAddresses[0].value : null,
      picture: response.coverPhotos ? response.coverPhotos[0].url : null,
      provider: 'custom-google',
      at: response.access_token
    })

  const options = {
    authorization_uri: 'https://www.googleapis.com/oauth2/v4/token',
    profile_uri: 'https://people.googleapis.com/v1/people/me',
    profileMap
  }

  return customGoogle.callback(event, options, {
    authorization: { grant_type: 'authorization_code' },
    profile: { person_fields: 'emailAddresses,names' }
  })
}

module.exports = {
  signinHandler,
  callbackHandler
}
