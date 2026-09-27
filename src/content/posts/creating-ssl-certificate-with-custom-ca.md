---
title: "Creating SSL Certificate with Custom CA"
description: "Creating a custom root CA for internal use and issuing SSL certificates with OpenSSL."
date: 2021-07-04T05:15:51Z
updated: 2022-05-06T08:50:16Z
tags: [openssl, certificate, x509, selfsign]
---

## Creating Default OpenSSL Config File

<details>
    <summary>Sample of <a href="https://gist.github.com/fakhrulhilal/70c80aa5331a92e0138f7c280b43fe11">openssl.cnf</a></summary>

```ini
#
# OpenSSL example configuration file.
# This is mostly being used for generation of certificate requests.
#

# Note that you can include other files from the main configuration
# file using the .include directive.
#.include filename

# This definition stops the following lines choking if HOME isn't
# defined.
HOME                    = .
SAN                     = CN:copy

# Extra OBJECT IDENTIFIER info:
#oid_file               = $ENV::HOME/.oid
oid_section             = new_oids

# To use this configuration file with the "-extfile" option of the
# "openssl x509" utility, name here the section containing the
# X.509v3 extensions to use:
# extensions        =
# (Alternatively, use a configuration file that has only
# X.509v3 extensions in its main [= default] section.)

[ new_oids ]

# We can add new OIDs in here for use by 'ca', 'req' and 'ts'.
# Add a simple OID like this:
# testoid1=1.2.3.4
# Or use config file substitution like this:
# testoid2=${testoid1}.5.6

# Policies used by the TSA examples.
tsa_policy1             = 1.2.3.4.1
tsa_policy2             = 1.2.3.4.5.6

[ tsa ]
default_tsa             = tsa_config1

[ tsa_config1 ]

# These are used by the TSA reply generation only.
crypto_device           = builtin        # OpenSSL engine to use for signing
signer_digest           = sha256            # Signing digest to use. (Optional)
default_policy          = tsa_policy1
other_policies          = tsa_policy2, tsa_policy3    # acceptable policies (optional)
digests                 = sha1, sha256, sha384, sha512  # Acceptable message digests (mandatory)
accuracy                = secs:1, millisecs:500, microsecs:100    # (optional)
clock_precision_digits  = 0    # number of digits after dot. (optional)
# Is ordering defined for timestamps?
# (optional, default: no)
ordering                = yes
# Must the TSA name be included in the reply?
# (optional, default: no)
tsa_name                = yes
# Must the ESS cert id chain be included?
# (optional, default: no)
ess_cert_id_chain       = no
# algorithm to compute certificate
# identifier (optional, default: sha1)
ess_cert_id_alg         = sha256

[ ca ]
default_ca              = CA_default

[ CA_default ]
x509_extensions         = web_cert
default_days            = 365
policy                  = default_policy

[ default_policy ]
countryName             = match
stateOrProvinceName     = match
organizationName        = match
organizationalUnitName  = optional
commonName              = supplied
emailAddress            = optional

[ ca_policy ]
countryName             = match
stateOrProvinceName     = optional
organizationName        = match
organizationalUnitName  = optional
commonName              = supplied
emailAddress            = optional

[ optional_policy ]
countryName             = optional
stateOrProvinceName     = optional
localityName            = optional
organizationName        = optional
organizationalUnitName  = optional
commonName              = supplied
emailAddress            = optional

[ smime_policy ]
countryName             = optional
stateOrProvinceName     = optional
localityName            = optional
organizationName        = optional
organizationalUnitName  = optional
commonName              = optional
emailAddress            = match

[ req ]
default_bits            = 2048
distinguished_name      = req_distinguished_name
attributes              = req_attributes
x509_extensions         = web_cert    # The extensions to add to the self signed cert
# req_extensions        = v3_req

# Passwords for private keys if not present they will be prompted for
# input_password = secret
# output_password = secret

# This sets a mask for permitted string types. There are several options.
# default: PrintableString, T61String, BMPString.
# pkix     : PrintableString, BMPString (PKIX recommendation before 2004)
# utf8only: only UTF8Strings (PKIX recommendation after 2004).
# nombstr : PrintableString, T61String (no BMPStrings or UTF8Strings).
# MASK:XXXX a literal mask value.
# WARNING: ancient versions of Netscape crash on BMPStrings or UTF8Strings.
string_mask = utf8only

[ req_attributes ]
challengePassword       = A challenge password
challengePassword_min   = 4
challengePassword_max   = 20

[ req_distinguished_name ]
countryName             = Country Name (2 letter code)
countryName_default     = ID
countryName_min         = 2
countryName_max         = 2

stateOrProvinceName     = State or Province Name (full name)
stateOrProvinceName_default    = Jakarta

localityName            = Locality Name (eg, city)

0.organizationName      = Organization Name (eg, company)
0.organizationName_default = Personal Company

# we can do this but it is not needed normally :-)
#1.organizationName     = Second Organization Name (eg, company)
#1.organizationName_default = World Wide Web Pty Ltd

organizationalUnitName  = Organizational Unit Name (eg, section)
#organizationalUnitName_default =

commonName              = Common Name (e.g. server FQDN or YOUR name)
commonName_max          = 64

emailAddress            = Email Address
emailAddress_max        = 64

#######################################################################
# Signing cert: certificate for non CA
#######################################################################
[ web_cert ]
# This goes against PKIX guidelines but some CAs do it and some software
# requires this to avoid interpreting an end user certificate as a CA.
basicConstraints        = critical, CA:FALSE
# This is typical in keyUsage for a client certificate.
keyUsage                = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage        = serverAuth, clientAuth

# PKIX recommendations harmless if included in all certificates.
subjectKeyIdentifier    = hash
authorityKeyIdentifier  = keyid:always, issuer:always

# optional: create separate config file, execute with -extfile file.cnf
# signing multiple domains/IPs
#subjectAltName = DNS:*.dev.lab, DNS:dev.lab, IP:127.0.0.1
subjectAltName          = $ENV::SAN
# Special certificate for ASP.NET development
# TODO: find exact value for version in byte, not in BER format
1.3.6.1.4.1.311.84.1.1  = ASN1:INT:2

#######################################################################
# Signing cert: certificate for intermedia CA
#######################################################################
[ ica_cert ]
basicConstraints        = critical, CA:TRUE, pathlen:0
keyUsage                = cRLSign, keyCertSign, digitalSignature
subjectKeyIdentifier    = hash
authorityKeyIdentifier  = keyid:always, issuer:always

#######################################################################
# Signing cert: self signed for CA's cert
#######################################################################
[ ca_cert ]
basicConstraints        = critical, CA:TRUE
keyUsage                = cRLSign, keyCertSign, digitalSignature
extendedKeyUsage        = critical, serverAuth, clientAuth, codeSigning, emailProtection, timeStamping
subjectKeyIdentifier    = hash
authorityKeyIdentifier  = keyid:always, issuer:always

#######################################################################
# Signing cert: code signing
#######################################################################
[ codesign_cert ]
basicConstraints        = critical, CA:FALSE
keyUsage                = critical, nonRepudiation, digitalSignature
extendedKeyUsage        = critical, codeSigning, msCodeInd, msCodeCom, msCTLSign, timeStamping
subjectKeyIdentifier    = hash
authorityKeyIdentifier  = keyid:always, issuer:always

#######################################################################
# Signing cert: for S/MIME certificate
#######################################################################
[ smime_cert ]
# https://tools.ietf.org/html/rfc3850
# digitalSignature is required, used for signing email
keyUsage                = digitalSignature, nonRepudiation, keyEncipherment
# emailProtection is used for encrpyting message
extendedKeyUsage        = emailProtection
subjectAltName          = email:copy
subjectKeyIdentifier    = hash
authorityKeyIdentifier  = keyid:always, issuer:always

#######################################################################
# Read config from environment variable with shorten of key name
#######################################################################
[ env ]
subjectAltName          = $ENV::SAN
```
</details>

## Creating Custom Root CA

Creating the CA key:
`openssl genrsa -des3 -out root-CA.key 4096`
Note: remove `-des` option to create key without password

Creating self sign CA certificate

```powershell
openssl req -x509 -new -nodes -key root-CA.key -sha256 -days 3650 -out root-CA.crt `
	-subj "/C=ID/O=Dev lab/CN=Dev lab Root CA" `
	-addext 'keyUsage = cRLSign, keyCertSign, digitalSignature' `
	-addext 'extendedKeyUsage = critical, serverAuth, clientAuth, codeSigning, emailProtection, timeStamping' `
	-addext 'subjectKeyIdentifier=hash' `
	-addext 'authorityKeyIdentifier=keyid:always,issuer:always' `
	-addext "basicConstraints = critical, CA:TRUE"
```

Explanations:

- `subj`
  create unattended answer subject

- `basicConstraints`
  _CA:TRUE_ means it's issuer

- `keyUsage`
  determine what's this cert for: certificate signing (_keyCertSign_), CRL signing (_cRLSign_), digital signature

- `extendedKeyUsage`
  an extended version of `keyUsage`: server authentication (_serverAuth_), client authentication (_clientAuth_), file/code signing (_codeSigning_), S/MIME signing (_emailProtection_), time stamping

- `subjectKeyIdentifier`
  identifier of this cert

- `authoritykKeyIdentifier`

  the identifier which signs the cert, if it's root cert, then it should be itself

Shorter version

`openssl req -config openssl.cnf -x509 -new -nodes -key root-CA.key -out root-CA.crt -days 3650 -extensions ca_cert -subj "/C=ID/O=Dev Lab/CN=Dev Lab Root CA"`

Reference: [OpenSSL man page](https://www.openssl.org/docs/manmaster/man5/x509v3_config.html)

Inspect root CA certificate
`openssl x509 -noout -text -in root-CA.crt`

Convert into PKCS12 (.pfx) format
`openssl pkcs12 -export -name "Root CA" -out root-CA.pfx -inkey root-CA.key -in root-CA.crt`
Then import the pfx file into local machine placed under _Trusted Root Certification Authorities_

## Creating Intermediate CA

Creating the intermedia CA key
`openssl genrsa -out server-CA.key 4096`

Creating intermediate certificate request

`openssl req -new -key server-CA.key -out server-CA.csr -subj "/C=ID/O=Dev Lab/OU=Development/CN=Dev Lab Server CA"`

Sign the intermedia CA certificate's request with CA's key and cert:
`openssl x509 -extfile openssl.cnf -req -in server-CA.csr -CA root-CA.crt -CAkey root-CA.key -CAcreateserial -out server-CA.crt -extensions ica_cert -days 3650`

Inspect root CA certificate
`openssl x509 -noout -text -in server-CA.crt`

Convert into PKCS12 format
`openssl pkcs12 -export -name "Dev lab Server CA" -inkey server-CA.key -in server-CA.crt -out server-CA.pfx`
Then import the pfx file into local machine placed under _Intermediate Certification Authorities_

## Creating User Certificate

Creating the certificate key
`openssl genrsa -out dev.lab.key 2048`

Before moving on, the openssl config is configured to accept subject alternate name from environment variable named `SAN` (see line 176), so you need to configure first, otherwise, it will fail: `$Env:SAN = 'DNS:*.dev.lab, DNS:dev.lab'`. You can set it to the same as CN if you don't want to assign it to wilcard domain. We can also assign it to IP address as follows: `$Env:SAN = 'DNS:*.dev.lab,DNS:dev.lab,DNS:localhost,IP:127.0.0.1'`. After that, we can continue to create certificate request
```powershell
openssl req -new -key dev.lab.key -out dev.lab.csr -subj "/C=ID/ST=Jakarta/O=Dev Home/OU=Development/CN=*.dev.lab"
```

Sign the certificate request using server CA's key and certificate

```powershell
openssl x509 -extfile openssl.cnf -extensions web_cert -req -CA server-CA.crt `
	-CAkey server-CA.key -CAcreateserial -days 365 `
	-in dev.lab.csr -out dev.lab.crt
```

Convert into PKCS12 format
`openssl pkcs12 -export -name "dev.lab Certificate" -inkey dev.lab.key -in dev.lab.crt -out dev.lab.pfx`

Import the .pfx file into local machine using default location.

## Creating S/MIME Certificate

Creating the certificate key

`openssl genrsa -out iroel-email.key 2048`

Creating certificate request
`openssl req -new -key iroel-email.key -out iroel-email.csr -subj "/C=ID/ST=Jakarta/CN=Fakhrulhilal Maktum/emailAddress=iroel@dev.lab" -addext "subjectAltName = email:iroel@dev.lab, email:iroel@other.lab"`

Sign the certificate request using server CA's key and certificate

```powershell
$Env:SAN = 'email:iroel@dev.lab, email:iroel@dev.test'
openssl x509 -extfile openssl.cnf -extensions smime_cert -req -CA server-CA.crt `
	-CAkey server-CA.key -CAcreateserial -setalias "Dev email certificate" `
	-in iroel-email.csr -out iroel-email.crt -trustout -days 365
```

Convert into PKCS12 format
`openssl pkcs12 -export -name "wilcard.dev.lab Certificate" -inkey dev.lab.key -in dev.lab.crt -out dev.lab.pfx`

Import the .pfx file into local machine using default location.

## Installing Certificates

### Installing CAs' Certificate

1. Install root certificate (root-CA.crt) to *Trusted Root Certification Authorities* in machine level
2. Install intermediate certificate (server-CA.crt) to *Intermediate Certification Authorities*

### Install IIS Express Certificate

Install the certificate in Local Machine wide and in default location (Personal). Run this powershell with administrator privilege. Friendly name is `-name` parameter value when converting into PKCS12 format.

```powershell
$PfxPassword = 'pfx_password'
#$Certificate = Get-ChildItem Cert:\LocalMachine\My | ?{ $_.FriendlyName -eq 'localhost' }
$Certificate = Get-PfxCertificate -FilePath .\dev.lab.pfx -Password (ConvertTo-SecureString -String $PfxPassword -AsPlainText)
$IisExpress = Get-CimInstance Win32_Product -Filter 'Name like "IIS%Express%"'
for ($Port = 44300; $Port -lt 44400; $Port++) {
    netsh http delete sslcert ipport=0.0.0.0:$Port
    netsh http add sslcert ipport=0.0.0.0:$Port  certhash="$($Certificate.Thumbprint)"  appid="$($IisExpress.IdentifyingNumber)"
}
```

### Installing Kestrel Certificate

1. Using environment variable
   `ASPNETCORE_Kestrel__Certificates__Default__Path` = path to pfx file
   `ASPNETCORE_Kestrel__Certificates__Default__Password` = pfx's password

2. Using appsettings.json
```json
{
  "Kestrel": {
    "Certificates": {
      "Default": {
        "Path": "path/to/pfx/file",
        "Password": "pfx's password",
        /* or using .crt and key file */
        /*
        "Path": "path/to/crt/file",
        "KeyPath": "path/to/key/file"
        */
      }
    }
  }
}
```
Reference: [Configure endpoints for the ASP.NET Core Kestrel web server](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/endpoints)

3. Using dotnet tool: `dotnet dev-certs https --clean -i .\dev.lab.pfx -p the_password`

### Installing remote desktop certificate

```powershell
$PfxPassword = 'pfx_password'
#$Certificate = Get-ChildItem Cert:\LocalMachine\My | ?{ $_.FriendlyName -eq 'localhost' }
$Certificate = Get-PfxCertificate -FilePath .\dev.lab.pfx -Password (ConvertTo-SecureString -String $PfxPassword -AsPlainText)
wmic /namespace:\\root\cimv2\TerminalServices PATH Win32_TSGeneralSetting Set SSLCertificateSHA1Hash="$($Certificate.Thumbprint)"
````
