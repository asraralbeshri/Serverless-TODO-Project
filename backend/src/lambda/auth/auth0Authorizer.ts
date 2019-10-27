import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const jwksUrl = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJLHLirYZv6850MA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi1kanY1dnAyOS5hdXRoMC5jb20wHhcNMTkxMDIyMDczNTAxWhcNMzMw
NjMwMDczNTAxWjAhMR8wHQYDVQQDExZkZXYtZGp2NXZwMjkuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmf8djr6eloFEX/XxPVm28yzy
RdwGWc0eLZdvji4bsX88xiE/+o+OGpD5fndGe4MZKdYETa7Ect2dRT60YBEXkNTP
2rY03x5om4NxvcKKK/dvjJowDL05PI0BxJ6JdMp5fgqqBFFFPVAyo5rIJQXqRwD5
60BGCUCmyDvAznuI/xUXxN4/Uam9EIu6LT4r0lk22mVhRFChkMJvVBB/8kHqPg8E
EkIhmbUNi5VPLmpNZ4ZJSNic79zFDk3m/Y7GmGu3BLNvioSYLC0CSJIrWLrMXicl
9lQIjIYlrzTRm4RkF6tuxe90aXodm+LdR+V0dLi51ecrrgkzxPqyQajBPM9BkQID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBT8DWkPXuBnFmNAScl2
5QS/KdRVIzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAI/PoWv5
KxtmnQlURnMZrQgHn1rqWf1HrPL/uIjC9Ynidz2r4yGW+ot+O4ZOYfOccNMdtfvb
gFhsTWfHRWoqpHCHZZN24FwJVuJBKizO5WXqPDWcmflyWZrD6bm/sivxKvm8VQrI
IAF7DD5HWHLsFwzAK8bSuxKMEXXQRnk/9VN/xtFrvKICzz/S3NZnK5d19wA41+bi
fio4OA4YiTN1SgkibK7+a2Xy8sog7PU79TeQVvpN1TA3CGQVMs/zNy8gfvwqht4p
ivosUieJjFvJ/f6FfuPnTCMzAHdgivJsx2KcpSw5gpcb6HtC76HKSWwwusru0WIm
wniD8Eky7TpbG1Y=
-----END CERTIFICATE-----
`
// TODO: Provide a URL that can be used to download a certificate that can be used
//const jwksUrl = 'https://dev-djv5vp29.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // TODO: Implement token verification
  return verify(
    token,           // Token from an HTTP header to validate
    jwksUrl,            // A certificate copied from Auth0 website
    { algorithms: ['RS256'] } // We need to specify that we use the RS256 algorithm
  ) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
