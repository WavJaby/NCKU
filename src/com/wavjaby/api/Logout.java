package com.wavjaby.api;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.wavjaby.json.JsonBuilder;
import org.jsoup.Connection;
import org.jsoup.helper.HttpConnection;

import java.io.IOException;
import java.io.OutputStream;
import java.net.CookieManager;
import java.net.CookieStore;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import static com.wavjaby.Cookie.*;
import static com.wavjaby.Lib.getRefererUrl;
import static com.wavjaby.Lib.setAllowOrigin;
import static com.wavjaby.Main.courseNckuOrg;
import static com.wavjaby.Main.pool;

public class Logout implements HttpHandler {
    @Override
    public void handle(HttpExchange req) {
        pool.submit(() -> {
            long startTime = System.currentTimeMillis();
            CookieManager cookieManager = new CookieManager();
            CookieStore cookieStore = cookieManager.getCookieStore();
            Headers requestHeaders = req.getRequestHeaders();
            String refererUrl = getRefererUrl(requestHeaders);

            try {
                // unpack cookie
                String loginState = getDefaultCookie(requestHeaders, cookieManager);

                // login
                JsonBuilder data = new JsonBuilder();
                boolean success = logout(data, cookieStore);

                Headers responseHeader = req.getResponseHeaders();
                packLoginStateCookie(responseHeader, loginState, refererUrl, cookieStore);

                byte[] dataByte = data.toString().getBytes(StandardCharsets.UTF_8);
                responseHeader.set("Content-Type", "application/json; charset=UTF-8");

                // send response
                setAllowOrigin(requestHeaders, responseHeader);
                req.sendResponseHeaders(success ? 200 : 400, dataByte.length);
                OutputStream response = req.getResponseBody();
                response.write(dataByte);
                response.flush();
                req.close();
            } catch (IOException e) {
                req.close();
                e.printStackTrace();
            }
            System.out.println("[Logout] Logout " + (System.currentTimeMillis() - startTime) + "ms");
        });
    }

    public boolean logout(JsonBuilder outData, CookieStore cookieStore) {
        try {
            Connection.Response toLogin = HttpConnection.connect(courseNckuOrg + "/index.php?c=auth&m=logout")
                    .cookieStore(cookieStore)
                    .execute();

            outData.append("login", toLogin.body().contains("/index.php?c=auth&m=logout"));
            return true;
        } catch (Exception e) {
            outData.append("err", "[Login] Unknown error: " + Arrays.toString(e.getStackTrace()));
        }
        return false;
    }
}
