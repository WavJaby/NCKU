package com.wavjaby;

import com.wavjaby.lib.PropertiesReader;
import com.wavjaby.logger.Logger;

import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.nio.file.Files;

public class ProxyManager {
    private static final String TAG = "[ProxyManager]";
    private static final Logger logger = new Logger(TAG);
    private ProxyData proxy;

    public static class ProxyData extends ProxyInfo {
        public final String ip;
        public final int port;
        public final String protocol;
        private final Proxy proxy;

        public final String providerUrl;


        public ProxyData(String ip, int port, String protocol, String providerUrl) {
            this.ip = ip;
            this.port = port;
            this.protocol = protocol;
            this.providerUrl = providerUrl;

            this.proxy = new Proxy(getProxyType(), new InetSocketAddress(ip, port));
        }

        public ProxyData(String url, String providerUrl) {
            int protocolEnd = url.indexOf("://");
            this.protocol = url.substring(0, protocolEnd);
            int ipEnd = url.indexOf(':', protocolEnd + 3);
            this.ip = url.substring(protocolEnd + 3, ipEnd);
            int portEnd = ipEnd + 1;
            for (; portEnd < url.length(); portEnd++)
                if (url.charAt(portEnd) < '0' || url.charAt(portEnd) > '9')
                    break;
            this.port = Integer.parseInt(url.substring(ipEnd + 1, portEnd));
            this.providerUrl = providerUrl;

            this.proxy = new Proxy(getProxyType(), new InetSocketAddress(ip, port));
        }

        public String toUrl() {
            return protocol + "://" + ip + ':' + port;
        }

        public String toIp() {
            return ip + ':' + port;
        }

        public Proxy.Type getProxyType() {
            return protocol.startsWith("socks")
                    ? Proxy.Type.SOCKS
                    : protocol.startsWith("http")
                    ? Proxy.Type.HTTP
                    : Proxy.Type.valueOf(protocol.toUpperCase());
        }

        public Proxy toProxy() {
            return this.proxy;
        }

        @Override
        public int hashCode() {
            String[] ips = ip.split("\\.");
            return (Integer.parseInt(ips[0]) << 24) +
                    (Integer.parseInt(ips[1]) << 16) +
                    (Integer.parseInt(ips[2]) << 8) +
                    Integer.parseInt(ips[3]) | port;
        }

        @Override
        public boolean equals(Object obj) {
            if (obj == null) return false;
            if (!(obj instanceof ProxyData)) return false;
            return ((ProxyData) obj).protocol.equals(protocol) &&
                    ((ProxyData) obj).ip.equals(ip) &&
                    ((ProxyData) obj).port == port;
        }
    }

    public static abstract class ProxyInfo {
        private int ping = -1;
        private boolean available = false;

        public void setPing(int ping) {
            this.ping = ping;
        }

        public int getPing() {
            return ping;
        }

        public void setAvailable(boolean available) {
            this.available = available;
        }

        public boolean isAvailable() {
            return available;
        }

        public boolean isUnavailable() {
            return !available;
        }
    }

    ProxyManager(PropertiesReader properties) {
        if (!properties.getPropertyBoolean("useProxy", true))
            return;

        String proxiesString = null;
        try {
            File proxyTxtFile = new File("proxy.txt");
            if (proxyTxtFile.exists())
                proxiesString = new String(Files.readAllBytes(proxyTxtFile.toPath()));
        } catch (IOException e) {
            e.printStackTrace();
        }
        ProxyData proxyData;
        if (proxiesString != null) {
            String[] proxies = proxiesString.split("\r?\n");
            if (proxies[0].length() == 0)
                proxyData = null;
            else
                proxyData = new ProxyData(proxies[0], "local");
        } else
            proxyData = null;

        if (proxyData != null) {
            logger.log("Using proxy: " + proxyData.toUrl());
            proxy = proxyData;
        } else
            proxy = null;
    }

    public Proxy getProxy() {
        if (proxy == null)
            return null;
        return proxy.toProxy();
    }

    public ProxyData getProxyData() {
        return proxy;
    }

}
