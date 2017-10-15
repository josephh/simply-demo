"use strict";

use(function () {

    var AjaxUtils = {}, 
        httpRequest,
        value;

    AjaxUtils.fetchHeadlessContent = function (t, item) {
        var responseJson;
        if(t == "kentico") {
            var url = "https://deliver.kenticocloud.com/615bf5da-4720-450f-813f-ac824dcb831f/items/" + item;
  		    value = JSON.parse(fetch(url)).item.elements.article_entry.value;
        }

        if(t == "contentful") {
            responseJson = parseContentful(fetch('',item));
        }

        console.log("Headless CMS value for inclusion in page : " + value);
        return value; 
    }

    function fetch(url) {
        var
            getRequest = new org.apache.commons.httpclient.methods.GetMethod(url),
            client = new org.apache.commons.httpclient.HttpClient(),
            status = new org.apache.commons.httpclient.HttpStatus()
        console.log("Retrieving data from " + url);
        try {
            var statusCode = client.executeMethod(getRequest);
            console.log(statusCode);
            if (statusCode == status.SC_OK) {
                inputStream = getRequest.getResponseBodyAsString();
                console.log('Retrieved Data : ' + inputStream);
            } else {
                console.log('Failed to execute http method');
            }
        } catch (e) {
            console.log(e);
        } finally {
            console.log('Finished');
        }
        return inputStream;
    }


    return AjaxUtils;

});
