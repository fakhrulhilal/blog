---
title: "Getting started with GPG key for signing git commit"
description: "Setting up a GPG key on Windows and configuring Git to sign commits with it."
date: 2021-07-04T05:27:49Z
updated: 2021-08-18T07:30:55Z
tags: [gpg, openpgp, git, signing]
---

## Configuring Git and GPG

After installing [git](https://git-scm.com/downloads), you need to add git's binary path to the PATH environment, located in `%ProgramFiles%\Git\usr\bin`. 

## GPG Key

### Create new key

Generate a key: `gpg --default-new-key-algo rsa4096 --gen-key`. After that, check again with this command:  `gpg --list-secret-keys --keyid-format LONG`, result example:

```bash
$ gpg --list-secret-keys --keyid-format LONG
/c/Users/fmaktum/.gnupg/pubring.gpg
-----------------------------------
sec   rsa4096/E170165D27E434C2 2018-07-22 [SC] [expires: 2022-07-23]
      FE428E022494CC3ED85ACDD3E170165D27E434C2
uid                 [ultimate] Fakhrulhilal Maktum <fakhrulhilal@gmail.com>
uid                 [ultimate] Fakhrulhilal Maktum <fakhrulhilal@outlook.com>
uid                 [ultimate] [jpeg image of size 13093]
ssb   rsa4096/C0D8267ED759FC4B 2018-07-22 [E] [expires: 2022-07-23]
```

in that case, key ID is `3AA5C34371567BD2`.

Next, we need to associate with the email address. To do that, we need to edit first by this command: `gpg --edit-key 3AA5C34371567BD2`

```bash
gpg> adduid
Real name: Fakhrulhilal Maktum
Email address: fakhrulhilal@outlook.com
Comment: 
You selected this USER-ID:
    "Fakhrulhilal Maktum <fakhrulhilal@outlook.com>"

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? o
```

Optionally, we can add the picture (suggested to use 240x288)

```
gpg> addphoto

```

After all changes, we can know save it

```bash
gpg> save
```

### Extending Expired Public Key

You need to edit the key by using this command: `gpg --edit-key `:

```bash
gpg> expire
Changing expiration time for a subkey.
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 2y
Key expires at Sun Jul 24 06:36:28 2022 SEAST
Is this correct? (y/N) y

sec  rsa4096/E170165D27E434C2
     created: 2018-07-22  expires: 2023-07-23  usage: SC
     trust: ultimate      validity: ultimate
ssb* rsa4096/C0D8267ED759FC4B
     created: 2018-07-22  expires: 2022-07-23  usage: E
[ultimate] (1). Fakhrulhilal Maktum <fakhrulhilal@gmail.com>
[ultimate] (2)  Fakhrulhilal Maktum <fakhrulhilal@outlook.com>
[ultimate] (3)  [jpeg image of size 13093]

gpg> key 1

sec  rsa4096/E170165D27E434C2
     created: 2018-07-22  expires: 2023-07-23  usage: SC
     trust: ultimate      validity: ultimate
ssb  rsa4096/C0D8267ED759FC4B
     created: 2018-07-22  expires: 2022-07-23  usage: E
[ultimate] (1). Fakhrulhilal Maktum <fakhrulhilal@gmail.com>
[ultimate] (2)  Fakhrulhilal Maktum <fakhrulhilal@outlook.com>
[ultimate] (3)  [jpeg image of size 13093]

gpg> expire
Changing expiration time for the primary key.
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 2y
Key expires at Sun Jul 24 06:36:36 2022 SEAST
Is this correct? (y/N) y

sec  rsa4096/E170165D27E434C2
     created: 2018-07-22  expires: 2022-07-23  usage: SC
     trust: ultimate      validity: ultimate
ssb  rsa4096/C0D8267ED759FC4B
     created: 2018-07-22  expires: 2022-07-23  usage: E
[ultimate] (1). Fakhrulhilal Maktum <fakhrulhilal@gmail.com>
[ultimate] (2)  Fakhrulhilal Maktum <fakhrulhilal@outlook.com>
[ultimate] (3)  [jpeg image of size 13093]
```

The first key is for extending primary key, the second command is for extending sub encryption key.

### Backup GPG Key

The easy way to backup all keys is by copy-paste the database

- public keys: `%UserProfile%\.gnupg\pubring.gpg`
- secret keys: `%UserProfile%\.gnupg\secring.gpg`
- trust db: `%UserProfile%\.gnupg\trustdb.gpg`

 [GPG manual](http://www.gnupg.org/documentation/manuals/gnupg/GPG-Configuration.html) suggests this command to backup trust db: `gpg --export-ownertrust > gpg-owner-trust.txt`.

To backup individual key:

- public key: `gpg --armor --export E170165D27E434C2 > public.gpg`
- secret key: `gpg --armor --export-secret-key E170165D27E434C2> secret.asc`

Or you can use the email address instead of the key ID, f.e. `git --armor --export fakhrulhilal@gmail.com > public.gpg`. Note that, secret key always contains public key.

We can also publish the GPG key to public server with this command: `gpg --keyserver [server address] --send-keys fakhrulhilal@gmail.com`. Some notable PGP public key servers:

- pgp.mit.edu
- pgp.key-server.io
- keyserver.pgp.com

### Import/Restore GPG Key

Importing secret key (along with public key): `gpg --import fakhrulhilal@gmail.com.asc`. After that, import all owner trust: `gpg --import-ownertrust gpg-owner-trust.txt`. Alternatively, we can trust by each key:

```bash
$ gpg --edit-key fakhrulhilal@gmail.com
gpg> trust
Your decision? 5 (Ultimate trust)
```

### Sharing GPG key to public key server

Below is currently active keyservers:
- pgp.mit.edu
- keyserver.ubuntu.com
- keys.openpgp.org
- keyserver1.pgp.com

To upload the key using gpg command, use `gpg --keyserver the_server --send-keys E170165D27E434C2`. Another way is by uploading manually to them. So we need to go their website and upload the key, commonly, they accept ASCII version of public key (`gpg --export --armor E170165D27E434C2`)

## Associating Git with GPG

### Setting GPG key for git commit

Set the key by using this command: `git config user.signingkey E170165D27E434C2`. And then we can sign the commit by [`-S`](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work) option. Alternatively, we can force all commit to be signed using this command `git config commit.gpgsign true`, so we don't have to specify `-S` parameter each time committing the change.

### Uploading public key to github

First, we need to backup the public key as follows: `gpg --armor --export E170165D27E434C2 > fakhrulhilal.gpg`

1. Login to your github account
2. Go to menu Settings > SSH and GPG keys
3. Add new gpg key
4. Copy-paste from `fakhrulhilal.gpg` content then save it

## References

- [Github: Generating a new GPG key](https://docs.github.com/en/github/authenticating-to-github/generating-a-new-gpg-key)
- [Github: Telling Git about your signing key](https://docs.github.com/en/github/authenticating-to-github/telling-git-about-your-signing-key)
- [Backup/restore GPG key](https://gist.github.com/chrisroos/1205934)
