---
title: "Connecting to Tailscale for limitted user"
description: "Connecting laptop to Tailscale network without installing GUI app due to limited user privilege."
date: 2026-10-09T14:15:00Z
tags: [vpn, tailscale, network, limited-user]
---

I have an old laptop that I haven't used for along time. It's ThinkPad T460p, a Windows 11 laptop which is not capable 
of handling recent job anymore. So I decide to use as it server playground to try something new, make it always online. 
I was working from home from a long time, until then I have to go hybrid. But this laptop has been my personal server 
for installing development servers that I've been using everyday, things like SQL Server, Azurite, Azure Cosmos, etc. 

I was looking for a way to make it accessible everywhere, especially whan I'm working at the office. There were 2 
suggestions: [Zerotier](https://www.zerotier.com) and [Tailscale](https://tailscale.com). Both services provide free 
option, ideal for hobbies like me. I decided to stick with Tailscale, it provides nice apps across Windows, linux, and 
MacOS. So I give it try, install it in my Macbook and my linux on top my ThinkPad laptop. I expose my local network 
through linux server. Actually, it's not necessary to expose personal network. The only reason is, so I can access 
my linux server at permanent address: lab.iroel.xyz which points to my personal address 192.168.1.5. So it doesn't 
matter wether I'm currently at home or at the office through Tailscale. It points to the same IP/domain. 

So far, it's pretty robust setup. The moment I'm connected to my Tailscale network, I can access my linux server 
everywhere, I can access my development services in it. It's been pretty good, until I have to switch to new Macbook from 
my company without admin privileges. Everything has to be done as limited user. To give you a context, I've been using 
my Windows 11 using limited user as daily user, but still hold my Administrator account in case I want to install some 
apps or another administrative privilege action. This was working well. It's been secure, no need to install additional 
antivirus, but still able to manage my laptop. But revoking administrative privilege entirely is different level. 
I have to request to my admin just for installing additional app. Of course, I have to request all apps needed for 
development for initial setup. But I don't want to install Tailscale, as it's not my personal laptop anymore.

Luckily, Tailscale provide Go client ([core](https://pkg.go.dev/tailscale.com@v1.104.1/cmd/tailscale), [daemon](https://pkg.go.dev/tailscale.com@v1.104.1/cmd/tailscaled)). 
Using [mise](https://mise.jdx.dev/lang/go.html), it's easy install.
```sh
mise use -g "go:tailscale.com/cmd/tailscale"
mise use -g "go:tailscale.com/cmd/tailscaled"
```

The idea uses [user-space networking](https://tailscale.com/docs/concepts/userspace-networking). Before that, I need to 
create [auth key](https://console.tailscale.com/admin/settings/keys), make it reusable (so I don't have to generate 
everytime I want to connect), pre-approved (no need to go to Tailscale dashboard just for approval). I use [fnox](https://fnox.jdx.dev) 
for storing this key and sync to private Github repo, so it's available anywhere. 

First, the tailscale daemon will act as a bridge to Tailscale network. 
```sh
TS_DIR="${TS_DIR:-/tmp/tailscale}"
mkdir -p "$TS_DIR"
TS_SOCKET=$"TS_DIR/ts.sock"
tailscaled --tun=userspace-networking \
    --socks5-server="localhost:1015" \
    --state="$TS_DIR/ts.state" \
    --socket="$TS_SOCKET" \
    >"$TS_DIR/tailscaled.log" 2>&1 &
```

Second, we will create a sock proxy to tailscale daemon
```sh
TS_AUTH_KEY="generated_tailscale_auth_key"
tailscale --socket="$TS_SOCKET" up --auth-key="$TAILSCALE_AUTH_KEY"

# check connection status
tailscale --socket="$TS_SOCKET" status
```

After that, I can connect to my linux server through ssh
```sh
ssh -o ProxyCommand="nc -X 5 -x localhost:1015 %h %p" lab.iroel.xyz
```

To make it easier, I configure my ssh (`~/.ssh/config`) as follows
```
Host lab.tailscale
    Hostname lab.my_ts_domain_name.ts.net
    ProxyCommand nc -X 5 -x localhost:1015 %h %p
```

So I can configure my [Zed remote development](https://zed.dev/docs/remote-development) as follows
```json
{
  "ssh_connections": [
    {
      "nickname": "lab@tailscale",
      "host": "lab.tailscale",
      "projects": [
        {
          "paths": [
            "~/proyek/dotfiles"
          ]
        }
      ]
    }
  ]
}
```

Pay attention at `host`, which refers to `Host` alias of `~/.ssh/config` file. 

Disconnecting is pretty simple: `tailscale --socket="$TS_SOCKET" down`. 

At the moment, I use this linux server as AI remote development. I don't use its development 
services which I've been using before. Assuming we're now doing less coding, so installing many 
plugins is not necessary anymore, AI will generate anything. And this [Zed AI feature](https://zed.dev/docs/ai/overview) 
is more than enough, it's lightweight, pretty smooth integratation from MacOS to linux. 
So I don't think I will use JB Rider more often, not even VScode. Zed is the most lightweight 
among both. 

See my AI generated script in [Github:dotfiles/shell/functions.tailscale.sh](https://github.com/fakhrulhilal/dotfiles/blob/master/shell/functions.tailscale.sh).
