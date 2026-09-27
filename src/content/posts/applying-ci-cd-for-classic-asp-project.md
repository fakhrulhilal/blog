---
title: "Applying CI/CD for classic ASP project"
description: "Adding CI/CD to a classic ASP project by replacing config placeholders at deploy time."
date: 2021-07-29T09:00:29Z
tags: [aspclassic, ci, transformation, pipeline]
---

A new challenge to add CI/CD support for classic ASP. You might be wondering why I take care of classic ASP project for nowadays😂. But I believe one of you know the reason already😁. Classic ASP project doesn't have configuration system by default. It used to store in ordinary ASP file and place anything in VBscript variables, f.e. config.asp. Fortunately, they used to store in centralized place, so we don't have to scan all configurations in many files.
So the basic idea is simple, introduce placeholder format and replace it before deploying. Let's use `#PLACEHOLDER#` as an example. I prefer to use all caps so I can pay attention easily what needed to be changed. See example below:
```vb
<%

Dim cfgSocials
Set cfgSocials = Server.CreateObject("Scripting.Dictionary")
cfgSocials.Add "github", "#SOCIAL_GITHUB#"
cfgSocials.Add "twitter", "#SOCIAL_TWITTER#"
cfgSocials.Add "linkedin", "#SOCIAL_LINKEDIN#"
cfgSocials.Add "email", "#SOCIAL_EMAIL#"

Dim cfgSite
Set cfgSite = Server.CreateObject("Scripting.Dictionary")
cfgSite.Add "name", "Portofolio"
cfgSite.Add "fullname", "#FULL_NAME#"
cfgSite.Add "address", "#ADDRESS#"

%>
```
After that, all we need to do read file content, and do find-replace based on placeholder. I'm a fan of powershell, because it's easy to write the script and its dotnet support is deadly insane👍. Here's the quick snippet
```powershell
function Get-Value([string]$Key) {
    $Value = $Configs[$Key]
    if (-not([string]::IsNullOrEmpty($Value))) {
        $Value
    } else {
        [System.Environment]::GetEnvironmentVariable($Key)
    }
}

$PlaceholderPattern = [regex]::new('#(?<placeholder>\w+)#')
$ParsedContent = Get-Content -Path $Path | %{
    $PlaceholderPattern.Replace($_, {
        param($Match)
        if ($Match.Success) {
            $Value = Get-Value -Key $Match.Groups['placeholder'].Value
            if (-not([string]::IsNullOrEmpty($Value))) {
                $Value
            } else {
                $Match.Value
            }
        } else {
            $Match.Value
        }
    })
}
Set-Content -Path $Path -Value $ParsedContent
```
In azure pipeline, it exposes all variables to environment variables. So it's easy to populate from pipeline definition to file. 

Take a look at [demo repo](https://dev.azure.com/fakhrulhilal/OpenSource/_git/asp-classic-demo) and give me feedback😊. I put all the details there.
