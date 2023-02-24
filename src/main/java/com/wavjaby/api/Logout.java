package com.wavjaby.api;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpHandler;
import com.wavjaby.ApiResponse;
import com.wavjaby.EndpointModule;
import com.wavjaby.json.JsonObjectStringBuilder;
import com.wavjaby.logger.Logger;
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

public class Logout implements EndpointModule {
    private static final String TAG = "[Logout] ";


    @Override
    public void start() {

    }

    @Override
    public void stop() {

    }

    private final HttpHandler httpHandler = req -> {
        long startTime = System.currentTimeMillis();
        CookieManager cookieManager = new CookieManager();
        CookieStore cookieStore = cookieManager.getCookieStore();
        Headers requestHeaders = req.getRequestHeaders();
        String refererUrl = getRefererUrl(requestHeaders);
        String loginState = getDefaultCookie(requestHeaders, cookieStore);

        try {
            // Logout
            ApiResponse apiResponse = new ApiResponse();
            logout(apiResponse, cookieStore);

            Headers responseHeader = req.getResponseHeaders();
            packLoginStateCookie(responseHeader, loginState, refererUrl, cookieStore);
            responseHeader.add("Set-Cookie",
                    removeCookie("authData") + "; Path=/api/login" + getCookieInfoData(refererUrl));

            byte[] dataByte = apiResponse.toString().getBytes(StandardCharsets.UTF_8);
            responseHeader.set("Content-Type", "application/json; charset=UTF-8");

            // send response
            setAllowOrigin(requestHeaders, responseHeader);
            req.sendResponseHeaders(apiResponse.isSuccess() ? 200 : 400, dataByte.length);
            OutputStream response = req.getResponseBody();
            response.write(dataByte);
            response.flush();
            req.close();
        } catch (IOException e) {
            req.close();
            e.printStackTrace();
        }
        Logger.log(TAG, "Logout " + (System.currentTimeMillis() - startTime) + "ms");
    };

    @Override
    public HttpHandler getHttpHandler() {
        return httpHandler;
    }

    private void logout(ApiResponse apiResponse, CookieStore cookieStore) {
        try {
            Connection.Response toLogin = HttpConnection.connect(courseNckuOrg + "/index.php?c=auth&m=logout")
                    .header("Connection", "keep-alive")
                    .cookieStore(cookieStore)
                    .ignoreContentType(true)
                    .execute();

            apiResponse.setData(new JsonObjectStringBuilder()
                    .append("login", toLogin.body().contains("/index.php?c=auth&m=logout"))
                    .toString()
            );
        } catch (Exception e) {
            apiResponse.addError(TAG + "Unknown error: " + Arrays.toString(e.getStackTrace()));
        }
    }
}
