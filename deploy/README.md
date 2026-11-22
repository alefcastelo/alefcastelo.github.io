# Deploy

The blog runs as a Node server on a Hostinger VPS, as an application in Dokploy. Dokploy builds the `Dockerfile` from GitHub on every push to `master` and serves the site over HTTPS through its Traefik. Everything below is set up by hand in the panels: the repository has no compose, proxy or deploy pipeline.

## 1. Create the VPS

In Hostinger, create a VPS with the **Ubuntu 24.04 with Dokploy** template. Open the Dokploy panel at `http://<vps-ip>:3000` and create the admin account.

## 2. Create the application

1. Connect GitHub in **Settings → Git → GitHub**: create the GitHub App and install it on the `alefcastelo/alefcastelo.github.io` repository.
2. Create a project and, inside it, an **Application**.
3. In the application's **General** tab:
   - **Provider**: GitHub, repository `alefcastelo/alefcastelo.github.io`, branch `master`.
   - **Build Type**: Dockerfile, with **Dockerfile Path** `Dockerfile`.
   - Make sure **Autodeploy** is on, so every push to `master` builds and deploys the new version.
4. Do not publish any port: leave **Advanced → Ports** empty. Traefik reaches the container over Dokploy's internal network, so the app's port 3000 stays unreachable from outside the VPS.

## 3. First deploy

Click **Deploy**. When the deployment finishes, open the application's **Logs** and check that the server is up:

```
➜ Listening on: http://localhost:3000/ (all interfaces)
```

Then check the site before the DNS points to it. In the application's **Domains** tab, click **Add Domain**, click the dice button next to **Host** ("Generate sslip.io domain"), set **Container Port** `3000`, leave **HTTPS** off and click **Create**. If Dokploy warns that you need to set an IP address, set it in **Web Server → Server → Update Server IP** and generate the domain again. Open `http://<generated-host>` and check that the home page, a post and `/me.jpg` load, and that an unknown URL such as `/nope` shows "Page not found" with status 404. Keep this domain until step 5.

## 4. Point the DNS to the VPS

In hPanel, open the DNS zone of `alefcastelo.com` and:

- replace the four GitHub Pages `A` records of `@` (`185.199.108.153` to `185.199.111.153`) with one `A` record to the VPS IPv4;
- delete the four GitHub Pages `AAAA` records of `@` (`2606:50c0:8000::153` to `2606:50c0:8003::153`), or point the `AAAA` record to the VPS IPv6;
- change the `www` CNAME from `alefcastelo.github.io` to `alefcastelo.com`.

## 5. Add the domains

1. Define a compression middleware for the HTML pages: in the panel's **Traefik File System**, open `dynamic/middlewares.yml`, click **Unlock**, add a `compress` entry under `http.middlewares`, keeping the entries already there (such as `redirect-to-https`), and click **Update**:

   ```yaml
   http:
     middlewares:
       compress:
         compress: {}
   ```

2. In the application's **Domains** tab, add `alefcastelo.com` and `www.alefcastelo.com`, each with **Container Port** `3000`, **HTTPS** on, the **Let's Encrypt** certificate provider and, in **Middlewares**, `compress@file` (type it and click **Add**).
3. In **Advanced → Redirects**, add the **Redirect to non-www** preset, so `www.alefcastelo.com` redirects to `alefcastelo.com`.
4. Wait for Let's Encrypt to issue the certificates. Then check that `https://alefcastelo.com` loads with a valid certificate, that `http://alefcastelo.com` and `https://www.alefcastelo.com` redirect to it, and that `curl -sI -H 'Accept-Encoding: gzip' https://alefcastelo.com/` shows `content-encoding: gzip`.
5. Delete the sslip.io domain added in step 3.

## 6. Turn off GitHub Pages

Only once `https://alefcastelo.com` is served by the VPS: in the GitHub repository, go to **Settings → Pages**, open the **⋯** menu next to "Your site is live at" and choose **Unpublish site**. Then point the repository's Website to the new domain:

```
gh repo edit alefcastelo/alefcastelo.github.io --homepage https://alefcastelo.com
```

## Before merging this PR, add to the Dokploy Environment

Nothing yet.
